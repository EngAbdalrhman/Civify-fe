#!/bin/sh
# Swarm host-add writes /etc/hosts but it may be unreadable by the nextjs user.
if [ -f /etc/hosts ]; then
  chmod 644 /etc/hosts 2>/dev/null || true
fi
if [ -f /etc/nsswitch.conf ]; then
  chmod 644 /etc/nsswitch.conf 2>/dev/null || true
fi
cd /app || exit 1

if command -v runuser >/dev/null 2>&1; then
  exec runuser -u nextjs -g nodejs -- node server.js
fi

# Fallback (debian slim)
exec su -s /bin/sh nextjs -c "exec node server.js"
