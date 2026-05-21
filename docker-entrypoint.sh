#!/bin/sh
# Swarm host-add writes /etc/hosts but it may be unreadable by the nextjs user.
if [ -f /etc/hosts ]; then
  chmod 644 /etc/hosts 2>/dev/null || true
fi
if [ -f /etc/nsswitch.conf ]; then
  chmod 644 /etc/nsswitch.conf 2>/dev/null || true
fi
cd /app || exit 1
# Drop to nextjs (uid 1001) — same user as before
exec runuser -u 1001 -g 1001 -- node server.js
