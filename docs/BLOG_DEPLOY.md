# Blog SSR — final fix (deploy only, no env changes)

## What this does

`src/lib/ssr-dispatcher.ts` installs a global undici dispatcher that overrides
DNS for known civify hosts. SSR fetches to `https://civify.cv/apis/...` and
`https://stg.civify.cv/apis/...` connect directly to the Traefik server IP
without any DNS lookup. TLS SNI still uses the real hostname so the certificate
validates correctly.

Built-in defaults (`src/lib/ssr-dispatcher.ts`):

```text
civify.cv      → 34.44.205.35
stg.civify.cv  → 34.44.205.35
```

No Dokploy environment changes required, no SSH keys in GitHub, no
`docker service update` needed on the server.

## Deploy

1. Push to `Staging` branch — GitHub Action builds the image and triggers Dokploy.
2. Wait for Dokploy to pull and restart.
3. Open `/en/blog` or any slug page. Blogs render.

## Verify (optional)

```bash
C=$(sudo docker ps --filter name=cvfrontend-prod --format "{{.ID}}" | head -1)
sudo docker logs "$C" --tail 20
# Should show "Ready" with no EAI_AGAIN errors after a blog page load.
```

## If the server IP ever changes

Set in Dokploy → frontend → Environment:

```env
BLOG_SSR_TARGET_IP=<new-ip>
BLOG_SSR_HOST_HEADER=stg.civify.cv
```

Or multi-host:

```env
BLOG_SSR_HOST_MAP=civify.cv=<ip>,stg.civify.cv=<ip>
```

## To disable

```env
BLOG_SSR_DISPATCHER=false
```
