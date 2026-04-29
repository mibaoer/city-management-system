# 

项目编号: 7563235240669511988

本项目是由 [网站开发专家](https://space.coze.cn/) 创建.

[**项目地址**](https://space.coze.cn/task/7563235240669511988)

## 本地开发

### 一键启动

推荐使用一键脚本，自动完成环境安装（Volta/Node/pnpm）、依赖安装并启动开发服务器。

对于 macOS/Linux 用户，推荐直接使用以下命令（最可靠）：

```sh
bash scripts/start.sh
```

如果已安装 pnpm，也可以使用：

```sh
pnpm start
```

脚本默认：
- 端口：3000（Vite）
- 绑定：0.0.0.0（可局域网访问）
- 首次运行会自动安装 Volta、Node LTS 与 pnpm，并执行 `pnpm install`

或使用 npm/npx 启动（无需 pnpm）：

```sh
# 使用本地依赖的 Vite
npm run dev:npm

# 或用 npx 直接启动（一次性）
npm install   # 若尚未安装依赖
npm run build:npm   # 构建（可选）
npm run dev:npm     # 开发启动
# 等价：npx vite --host --port 3000
```

### 环境准备

- 安装 [Node.js](https://nodejs.org/en)
- 安装 [pnpm](https://pnpm.io/installation)

### 操作步骤

- 安装依赖

```sh
pnpm install
```

- 启动 Dev Server

```sh
pnpm run dev
```

- 在浏览器访问 http://localhost:3000

### 常见操作

- 修改端口：编辑 `package.json` 中 `dev:client` 脚本，如 `vite --host --port 3000`
- 停止服务：
  - 使用终端前台运行时按 `Ctrl + C`
  - 或查找端口进程并结束：

```sh
lsof -iTCP -sTCP:LISTEN -P | grep 3000
kill <PID>
```

- 局域网访问：使用终端中显示的 `Network` 地址，例如 `http://<你的局域网IP>:3000/`

### 快捷命令

- 查看状态（默认端口 3000，可传参指定端口）：

```sh
pnpm status
# 或指定端口
pnpm status 3000
```

- 关闭服务（默认端口 3000，可传参指定端口）：

```sh
pnpm stop
# 或指定端口
pnpm stop 3000
```

> 提示 pnpm: command not found？
>
> 执行一次以下命令让当前 shell 识别 Volta 安装的 pnpm：
>
> ```sh
> ~/.volta/bin/volta setup && exec zsh
> # 或临时生效当前会话
> export VOLTA_HOME="$HOME/.volta" && export PATH="$VOLTA_HOME/bin:$PATH"
> ```
>
> 也可直接使用脚本（无需 pnpm）：
>
> ```sh
> bash scripts/start.sh
> bash scripts/status.sh 3000
> bash scripts/stop.sh 3000
> ```

### 浏览器兼容数据更新（可选）

若看到 Browserslist 数据过期提示，可执行：

```sh
npx update-browserslist-db@latest
```
