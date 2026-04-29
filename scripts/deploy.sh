#!/bin/bash

# 城市管理大屏部署脚本
# 使用方法: bash scripts/deploy.sh [环境] [服务器IP]
# 示例: bash scripts/deploy.sh production 192.168.1.100

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 环境参数
ENV=${1:-production}
SERVER_IP=${2}
SERVER_USER=${3:-root}
DEPLOY_PATH="/var/www/dashboard"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  城市管理大屏 - 部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查参数
if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}错误: 请提供服务器 IP 地址${NC}"
    echo -e "${YELLOW}用法: bash scripts/deploy.sh [环境] [服务器IP] [用户名]${NC}"
    echo -e "${YELLOW}示例: bash scripts/deploy.sh production 192.168.1.100 root${NC}"
    exit 1
fi

echo -e "${YELLOW}环境: ${ENV}${NC}"
echo -e "${YELLOW}服务器: ${SERVER_USER}@${SERVER_IP}${NC}"
echo -e "${YELLOW}部署路径: ${DEPLOY_PATH}${NC}"
echo ""

# 1. 本地构建
echo -e "${GREEN}[1/5] 开始本地构建...${NC}"
pnpm install
pnpm run build
echo -e "${GREEN}✓ 构建完成${NC}"
echo ""

# 2. 创建部署目录
echo -e "${GREEN}[2/5] 在服务器上创建部署目录...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${DEPLOY_PATH}"
echo -e "${GREEN}✓ 目录创建完成${NC}"
echo ""

# 3. 上传文件
echo -e "${GREEN}[3/5] 上传构建文件到服务器...${NC}"
rsync -avz --progress --delete dist/ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/
echo -e "${GREEN}✓ 文件上传完成${NC}"
echo ""

# 4. 配置 Nginx（如果不存在）
echo -e "${GREEN}[4/5] 检查并配置 Nginx...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
# 检查 Nginx 是否安装
if ! command -v nginx &> /dev/null; then
    echo "Nginx 未安装，正在安装..."
    apt update && apt install nginx -y
    systemctl start nginx
    systemctl enable nginx
fi

# 创建 Nginx 配置
cat > /etc/nginx/sites-available/dashboard << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /var/www/dashboard;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试并重启 Nginx
nginx -t && systemctl restart nginx
ENDSSH

echo -e "${GREEN}✓ Nginx 配置完成${NC}"
echo ""

# 5. 完成
echo -e "${GREEN}[5/5] 部署完成!${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署成功! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}访问地址:${NC}"
echo -e "  http://${SERVER_IP}"
echo -e "  http://${SERVER_IP}/dashboard"
echo ""
echo -e "${YELLOW}管理命令:${NC}"
echo -e "  查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/access.log'"
echo -e "  重启服务: ssh ${SERVER_USER}@${SERVER_IP} 'systemctl restart nginx'"
echo ""
