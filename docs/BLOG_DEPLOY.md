# Blog SSR — final fix (deploy only, no env changes)

## What this does

`src/lib/ssr-dispatcher.ts` patches Node's `dns.lookup` at server boot
(via `instrumentation.ts`) so SSR resolution survives broken Docker DNS:

1. **Known civify hosts** resolve directly to the Traefik IP — no DNS at all.
2. **Everything else** (Unsplash, ImageKit, Sentry, GA, ...) falls back to
   Cloudflare/Google DNS when the container's `/etc/resolv.conf` fails with
   `EAI_AGAIN`. This is why images stopped loading too — same root cause.

TLS SNI uses the real hostname so certs validate. No `/etc/hosts`, no Swarm
`host-add`, no SSH keys, no Dokploy env changes required.

Built-in defaults:

```text
civify.cv      → 34.44.205.35
stg.civify.cv  → 34.44.205.35
fallback DNS   → 1.1.1.1, 1.0.0.1, 8.8.8.8, 8.8.4.4
```

## Graceful failure

Blog service now returns empty / null on any fetch failure rather than
throwing. Result:

- `/blog` shows the "no posts" empty state if the API is temporarily down
  (instead of 500).
- `/blog/<slug>` triggers `notFound()` → 404 page (instead of 500).
- Homepage `BlogPreviewSection` keeps the section title visible and hides
  cards (instead of 500).

ISR revalidate dropped from 5 min → 1 min so any cached 404 self-heals fast.

## Deploy

1. Push **frontend** to `Staging` — GitHub Action builds and triggers Dokploy.
2. Deploy **backend** (`civify`) too — fixes Redis blog cache 500s (`publicBlogs-v3` + auto-evict on corrupt entries).
3. Wait for both services to restart.
4. Open `/en/blog`, any slug, the homepage. Blogs and cover images all load.

### Backend Redis (shared stg + prod — see `backend/civify/docs/BLOG_REDIS.md`)

**Do not run `FLUSHALL` or `FLUSHDB`** — that clears sessions, permissions, AI cache, etc. for **both** environments.

Delete **only** blog cache keys:

```bash
redis-cli --scan --pattern '*publicBlogs*' | xargs -r redis-cli DEL
```

Or deploy backend civify — startup purges `*publicBlogs*` automatically.

## Verify (optional)

```bash
C=$(sudo docker ps --filter name=cvfrontend-prod --format "{{.ID}}" | head -1)
sudo docker logs "$C" --tail 30
# No EAI_AGAIN errors. Should see "[SSR Dispatcher] installed ..." in dev mode.
```

## Env overrides (only if needed)

```env
# Server IP changed
BLOG_SSR_TARGET_IP=<new-ip>
BLOG_SSR_HOST_HEADER=stg.civify.cv

# Multi-host
BLOG_SSR_HOST_MAP=civify.cv=<ip>,stg.civify.cv=<ip>

# Different fallback DNS servers
BLOG_SSR_FALLBACK_DNS=1.1.1.1,8.8.8.8

# Disable entirely
BLOG_SSR_DISPATCHER=false
```
