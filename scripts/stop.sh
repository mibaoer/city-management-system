#!/usr/bin/env bash

set -euo pipefail

# 端口优先级：第一个参数 > 环境变量 PORT > 默认 3001
PORT_FROM_ARG="${1:-}"
if [[ -n "${PORT_FROM_ARG}" && "$PORT_FROM_ARG" =~ ^[0-9]+$ ]]; then
  PORT="$PORT_FROM_ARG"
else
  PORT="${PORT:-3001}"
fi

echo "[stop] Trying to stop server on port $PORT..."

if ! command -v lsof >/dev/null 2>&1; then
  echo "[stop] lsof not found. Please install lsof."
  exit 2
fi

set +e
PIDS=$(lsof -t -iTCP:$PORT -sTCP:LISTEN)
set -e

if [[ -z "${PIDS}" ]]; then
  echo "[stop] No process is listening on port $PORT"
  exit 0
fi

echo "[stop] Found PID(s): ${PIDS}"

for PID in ${PIDS}; do
  echo "[stop] Sending SIGTERM to ${PID}"
  kill ${PID} 2>/dev/null || true
done

sleep 1

set +e
STILL=$(lsof -t -iTCP:$PORT -sTCP:LISTEN)
set -e

if [[ -n "${STILL}" ]]; then
  echo "[stop] Force killing: ${STILL}"
  for PID in ${STILL}; do
    kill -9 ${PID} 2>/dev/null || true
  done
fi

echo "[stop] Done."


