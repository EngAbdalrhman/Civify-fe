const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const moduleResult = { exports: {} };
const memory = new Map();
const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
new Function('exports', 'localStorage', 'process', ts.transpileModule(fs.readFileSync('src/utils/auth-return.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(moduleResult.exports, storage, { env: {} });
const { safeReturnTo, rememberAuthReturn, readAuthReturn, clearAuthReturn, accountLinkRedirect } = moduleResult.exports;

test('rejects off-site, script, encoded backslash and protocol-relative login redirects', () => {
  for (const path of ['https://evil.example', '//evil.example', 'javascript:alert(1)', '/\\evil.example', '/%5cevil.example', '/%255cevil.example', '/%2fevil.example', '/\nevil.example', '/%00bad', '/%bad']) {
    assert.equal(safeReturnTo(path), null, path);
  }
  assert.equal(safeReturnTo('/mcp/connect?transaction=' + 't'.repeat(43)), '/mcp/connect?transaction=' + 't'.repeat(43));
});
test('preserves a pending connection across login/signup/verification and expires stale destinations', () => {
  rememberAuthReturn('/mcp/connect?transaction=' + 't'.repeat(43));
  assert.match(readAuthReturn(), /^\/mcp\/connect/);
  clearAuthReturn(); assert.equal(readAuthReturn(), null);
  memory.set('civify_auth_return', JSON.stringify({ path: '/app', expires: 1 }));
  assert.equal(readAuthReturn(), null);
  rememberAuthReturn('//evil.example'); assert.equal(readAuthReturn(), null);
});
test('only the configured gateway completion endpoint may receive a one-time code', () => {
  assert.equal(accountLinkRedirect('https://mcp.civify.cv/oauth/complete?transaction=t&code=c'), 'https://mcp.civify.cv/oauth/complete?transaction=t&code=c');
  for (const url of ['https://evil.example/oauth/complete?code=c', 'https://mcp.civify.cv/other', 'https://user:pass@mcp.civify.cv/oauth/complete', 'javascript:alert(1)']) {
    assert.throws(() => accountLinkRedirect(url));
  }
});
