#!/usr/bin/env bash
# Patch frontend Swarm service so SSR blog fetches reach the backend.
# Resolves backend VIP and adds /etc/hosts entry (works with nsswitch.conf in image).
# Usage: FRONTEND_SERVICE=cvfrontend-prod-j4vind BACKEND_SERVICE=civify-backend-uqcqfh ./scripts/patch-swarm-blog-network.sh

set -euo pipefail

FRONTEND_SERVICE="${FRONTEND_SERVICE:?Set FRONTEND_SERVICE}"
BACKEND_SERVICE="${BACKEND_SERVICE:?Set BACKEND_SERVICE}"
BACKEND_HOST="${BACKEND_HOST:-$BACKEND_SERVICE}"
BACKEND_PORT="${BACKEND_PORT:-8077}"

docker_cmd() {
  if command -v sudo >/dev/null 2>&1; then
    sudo docker "$@"
  else
    docker "$@"
  fi
}

echo "Frontend service: $FRONTEND_SERVICE"
echo "Backend service:  $BACKEND_SERVICE (host: $BACKEND_HOST)"

BACKEND_VIP="$(
  docker_cmd service inspect "$BACKEND_SERVICE" \
    --format '{{range .Endpoint.VirtualIPs}}{{.Addr}}{{"\n"}}{{end}}' \
  | head -1 \
  | cut -d/ -f1
)"

if [ -z "$BACKEND_VIP" ]; then
  echo "ERROR: Could not resolve VirtualIP for $BACKEND_SERVICE"
  exit 1
fi

echo "Backend VirtualIP: $BACKEND_VIP"
echo "Patching frontend service..."

docker_cmd service update \
  --dns-add 127.0.0.11 \
  --dns-add 1.1.1.1 \
  --host-add "${BACKEND_HOST}:${BACKEND_VIP}" \
  "$FRONTEND_SERVICE"

echo "Waiting for rollout..."
for i in $(seq 1 40); do
  STATE="$(
    docker_cmd service ps "$FRONTEND_SERVICE" \
      --filter "desired-state=running" \
      --format "{{.CurrentState}}" \
    | head -1 || true
  )"
  echo "  attempt $i: $STATE"
  echo "$STATE" | grep -q "Running" && break
  sleep 3
done

CONTAINER="$(
  docker_cmd ps --filter "name=${FRONTEND_SERVICE}" --format "{{.ID}}" | head -1
)"

if [ -z "$CONTAINER" ]; then
  echo "WARN: No running frontend container found"
  exit 0
fi

echo "Smoke test container: $CONTAINER"
docker_cmd exec -u root "$CONTAINER" cat /etc/nsswitch.conf 2>/dev/null || echo "WARN: no nsswitch.conf — redeploy latest HICv image or use INTERNAL_API_URL=http://${BACKEND_VIP}:${BACKEND_PORT}/apis"
docker_cmd exec -u root "$CONTAINER" grep "$BACKEND_HOST" /etc/hosts || true

docker_cmd exec "$CONTAINER" node -e "
  require('dns').lookup('${BACKEND_HOST}', (e, a) => {
    if (e) { console.error('lookup failed', e.message); process.exit(1); }
    console.log('lookup ok', a);
  });
" || echo "WARN: lookup failed — set INTERNAL_API_URL=http://${BACKEND_VIP}:${BACKEND_PORT}/apis in Dokploy"

docker_cmd exec "$CONTAINER" node -e "
  fetch('http://${BACKEND_HOST}:${BACKEND_PORT}/apis/v1/blogs')
    .then(r => { console.log('fetch status', r.status); if (!r.ok) process.exit(1); })
    .catch(e => { console.error(e.cause || e); process.exit(1); });
" || docker_cmd exec "$CONTAINER" node -e "
  fetch('http://${BACKEND_VIP}:${BACKEND_PORT}/apis/v1/blogs')
    .then(r => { console.log('fetch via VIP status', r.status); if (!r.ok) process.exit(1); })
    .catch(e => { console.error(e.cause || e); process.exit(1); });
"

echo ""
echo "Dokploy env (persists across deploys):"
echo "  INTERNAL_API_URL=http://${BACKEND_HOST}:${BACKEND_PORT}/apis"
echo "  (fallback if host-add missing: http://${BACKEND_VIP}:${BACKEND_PORT}/apis)"
echo "Done."
