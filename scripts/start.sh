#!/usr/bin/env bash

set -euo pipefail

# 项目根目录（脚本所在目录的上一级）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

# 安装 Volta（若未安装）
if ! command -v volta >/dev/null 2>&1; then
  echo "[setup] Installing Volta..."
  curl -fsSL https://get.volta.sh | bash -s -- --skip-setup
  export VOLTA_HOME="$HOME/.volta"
  export PATH="$VOLTA_HOME/bin:$PATH"
fi

echo "[setup] Using Volta at: $(command -v volta)"

# 安装 Node LTS 与 pnpm（若未安装）
if ! command -v node >/dev/null 2>&1; then
  volta install node@lts
fi
if ! command -v pnpm >/dev/null 2>&1; then
  volta install pnpm
fi

echo "[setup] Node: $(node -v)"
echo "[setup] pnpm: $(pnpm -v)"

# 安装依赖（允许更新锁文件以匹配 package.json）
echo "[deps] Installing dependencies..."
pnpm install --no-frozen-lockfile

# 启动开发服务器，默认绑定 0.0.0.0:3004
echo "[dev] Starting Vite dev server on port 3004..."
exec pnpm dev -- --host 0.0.0.0 "$@"


