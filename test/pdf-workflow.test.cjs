const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const ts = require('typescript');

// Exercise the actual TypeScript modules with isolated network/browser dependencies.
function load(file, dependencies = {}, env = {}, fetchImpl = fetch) {
  const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', 'process', 'fetch', compiled)(name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
    return dependencies[name];
  }, module, module.exports, { env }, fetchImpl);
  return module.exports;
}
const watermarkTypes = load('src/features/resume-builder/types/watermark.ts');
function policy(fetchImpl, env = { CIVIFY_API_URL: 'https://backend.example/apis' }) {
  return load('src/lib/watermark/resolveWatermark.ts', {
    '@/features/resume-builder/types/watermark': watermarkTypes,
  }, env, fetchImpl).resolveWatermarkForRequest;
}

test('API-key export resolves the authenticated backend policy and resume entitlement', async () => {
  let captured;
  const resolve = policy(async (url, options) => {
    captured = { url: String(url), headers: options.headers };
    return Response.json({ data: { enabled: false } });
  });
  const result = await resolve(new Request('https://frontend.example/api/generate-pdf', { headers: {
    'x-api-key': 'fixture-key', 'x-request-id': 'fixture-id', 'x-civify-mcp-tool': 'civify_tailor_cv',
  } }), undefined, 'existing-resume');
  assert.equal(result, undefined);
  assert.equal(captured.url, 'https://backend.example/apis/v1/external/cvs/watermark-config?resumeId=existing-resume');
  assert.equal(captured.headers.get('x-api-key'), 'fixture-key');
  assert.equal(captured.headers.get('x-request-id'), 'fixture-id');
});

test('untrusted request bodies cannot disable account watermark policy', async () => {
  const configured = { enabled: true, imageUrl: 'https://frontend.example/logo.png' };
  const resolve = policy(async () => Response.json({ data: configured }));
  assert.deepEqual(await resolve(new Request('https://frontend.example/api/generate-pdf'), { enabled: false }), configured);
});

test('unavailable policy falls back to the platform watermark', async () => {
  const resolve = policy(async () => new Response(null, { status: 503 }));
  const result = await resolve(new Request('https://frontend.example/api/generate-pdf'));
  assert.equal(result.enabled, true);
  assert.equal(result.imageUrl, 'https://frontend.example/brand/watermark.png');
});

test('PDF export recovers after an initial browser launch failure', async () => {
  let attempts = 0;
  const page = { setContent: async () => {}, evaluateHandle: async () => {}, pdf: async () => Buffer.from('%PDF-fixture'), close: async () => {} };
  const { POST } = load('src/app/api/generate-pdf/route.ts', {
    'next/server': { NextResponse: Response },
    'puppeteer-core': { launch: async () => {
      if (++attempts === 1) throw new Error('fixture launch failure');
      return { connected: true, on: () => {}, newPage: async () => page };
    } },
    '@/features/resume-builder/utils/renderResumeHtml': { renderResumeHtml: () => '<html>fixture</html>' },
    '@/lib/watermark/embedWatermarkImage': { embedWatermarkImage: async value => value },
    '@/lib/watermark/resolveWatermark': { resolveWatermarkForRequest: async () => undefined },
  });
  const request = () => new Request('https://frontend.example/api/generate-pdf', { method: 'POST', body: JSON.stringify({ resumeData: { personalInfo: {}, sections: [] } }) });
  assert.equal((await POST(request())).status, 500);
  const recovered = await POST(request());
  assert.equal(recovered.status, 200);
  assert.equal(await recovered.text(), '%PDF-fixture');
  assert.equal(attempts, 2);
});

test('all PDF layouts accept absent contact fields and respect hidden sections', () => {
  const { renderResumeHtml } = load('src/features/resume-builder/utils/renderResumeHtml.ts', {
    '@/features/resume-builder/utils/socialLinks': load('src/features/resume-builder/utils/socialLinks.ts'),
    '@/features/resume-builder/utils/renderWatermark': load('src/features/resume-builder/utils/renderWatermark.ts', {
      '@/features/resume-builder/types/watermark': watermarkTypes,
    }),
  });
  const resume = { personalInfo: { fullName: null, email: null }, sections: [
    { id: 'hidden', type: 'experience', title: 'Private section', visible: false, items: [{ title: 'Hidden Employer' }] },
    { id: 'work', type: 'experience', title: 'Experience', visible: true, items: [{ title: 'Visible Employer', subtitle: null }] },
  ] };
  for (const template of ['modern', 'classic', 'creative', 'executive', 'minimal', 'ats']) {
    const html = renderResumeHtml(resume, template, '#000000');
    assert.match(html, /Visible Employer/, template);
    assert.ok(!html.includes('Hidden Employer'), template);
  }
});
