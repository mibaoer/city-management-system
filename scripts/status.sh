#!/usr/bin/env bash

set -euo pipefail

# 端口优先级：第一个参数 > 环境变量 PORT > 默认 3001
PORT_FROM_ARG="${1:-}"
if [[ -n "${PORT_FROM_ARG}" && "$PORT_FROM_ARG" =~ ^[0-9]+$ ]]; then
  PORT="$PORT_FROM_ARG"
else
  PORT="${PORT:-3001}"
fi

echo "[status] Checking TCP LISTEN on port $PORT..."

if command -v lsof >/dev/null 2>&1; then
  if lsof -iTCP:$PORT -sTCP:LISTEN -n -P >/dev/null 2>&1; then
    echo "[status] Found listeners:"
    lsof -iTCP:$PORT -sTCP:LISTEN -n -P | awk 'NR==1 || /LISTEN/'
    echo "[status] Local:   http://localhost:$PORT/"
    IP=$(ipconfig getifaddr en0 2>/dev/null || true)
    if [[ -n "$IP" ]]; then
      echo "[status] Network: http://$IP:$PORT/"
    fi
    exit 0
  else
    echo "[status] No process is listening on port $PORT"
    exit 1
  fi
else
  echo "[status] lsof not found. Please install lsof."
  exit 2
fi


