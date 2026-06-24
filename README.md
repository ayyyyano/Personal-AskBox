# 个人提问箱

这是一个可以直接上线使用的匿名提问箱网站，适合放在个人主页、博客、社交资料页里收集匿名问题。

技术栈：

- Next.js App Router
- MDUI 2
- Cloudflare D1：保存问题和回答
- Cloudflare KV：提交限流
- Cloudflare R2：保存可选图片附件
- Cloudflare Turnstile：防机器人提交
- Cloudflare Workers / Vercel 部署

推荐部署方式是 **Cloudflare Workers**。这条路径可以完整使用 D1、KV、R2 和 Turnstile，也是本项目配置最完整的上线方式。

## 功能

- 访客匿名提交问题。
- 访客可选择填写昵称。
- 访客可上传一张图片附件。
- 提交问题时使用 Turnstile 做人机验证。
- 使用 KV 按 IP 做基础限流。
- 管理员登录后台查看问题。
- 管理员可以回答问题，并选择是否发布到首页。
- 首页只展示已经发布的问答。

## 准备账号

上线前需要准备：

- 一个 GitHub 账号，用来存放源码。
- 一个 Cloudflare 账号，用来创建 D1、KV、R2、Turnstile 和 Workers。
- 本机安装 Node.js 22 或更新版本。

如果只想部署到 Vercel，还需要一个 Vercel 账号。不过即使部署到 Vercel，也仍然需要 Cloudflare D1/KV/Turnstile。

## 下载项目

```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名
npm install
```

如果你还没有把项目上传到 GitHub，可以先在 GitHub 新建一个空仓库，然后把本项目文件推送上去。

## 本地配置

复制环境变量模板：

```bash
cp .env.example .env.local
```

Windows PowerShell 可以使用：

```powershell
Copy-Item .env.example .env.local
```

编辑 `.env.local`：

```env
SITE_NAME="个人提问箱"
SESSION_SECRET="换成一段很长的随机字符串"
ADMIN_PASSWORD="你的管理员密码"
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
```

说明：

- `SITE_NAME`：网站名称。
- `SESSION_SECRET`：用于签名登录 Cookie，建议使用 32 位以上随机字符串。
- `ADMIN_PASSWORD`：后台登录密码。
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`：Turnstile 前端 site key。
- `TURNSTILE_SECRET_KEY`：Turnstile 后端 secret key。

开发模式下如果没有填写 Turnstile secret，项目会允许本地提交；生产环境请务必填写。

## 本地运行

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

后台地址：

```text
http://localhost:3000/admin
```

## 创建 Cloudflare 资源

下面的命令需要先登录 Cloudflare：

```bash
npx wrangler login
```

### 1. 创建 D1 数据库

```bash
npx wrangler d1 create askbox-db
```

命令会输出类似内容：

```toml
database_name = "askbox-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

把 `database_id` 填入 `wrangler.jsonc`：

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "askbox-db",
    "database_id": "你的-d1-database-id"
  }
]
```

### 2. 创建 KV 命名空间

```bash
npx wrangler kv namespace create ASKBOX_KV
```

把输出里的 `id` 填入 `wrangler.jsonc`：

```jsonc
"kv_namespaces": [
  {
    "binding": "ASKBOX_KV",
    "id": "你的-kv-id"
  }
]
```

### 3. 创建 R2 Bucket

```bash
npx wrangler r2 bucket create askbox-uploads
```

确认 `wrangler.jsonc` 中的 bucket 名称一致：

```jsonc
"r2_buckets": [
  {
    "binding": "ASKBOX_R2",
    "bucket_name": "askbox-uploads"
  }
]
```

### 4. 创建 Turnstile

在 Cloudflare Dashboard 中打开：

```text
Turnstile -> Add widget
```

填写你的网站域名。开发时也可以加入：

```text
localhost
```

创建后会得到：

- Site key：填到 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Secret key：填到 `TURNSTILE_SECRET_KEY`

同时也要把 site key 填入 `wrangler.jsonc`：

```jsonc
"vars": {
  "SITE_NAME": "个人提问箱",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY": "你的-turnstile-site-key"
}
```

## 初始化数据库

本地 D1：

```bash
npm run db:local
```

远端 D1：

```bash
npm run db:remote
```

远端 D1 必须初始化，否则上线后提交问题会失败。

## 部署到 Cloudflare Workers

这是推荐部署方式。

### 1. 设置生产密钥

不要把真实密码和 secret 写进 GitHub。请用 Wrangler secret 设置：

```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put TURNSTILE_SECRET_KEY
```

每执行一条命令，终端会要求你输入对应值。

### 2. 构建并部署

```bash
npm run cf:deploy
```

部署成功后，终端会显示一个 `workers.dev` 网址。打开这个网址即可访问你的提问箱。

### 3. 绑定自定义域名

在 Cloudflare Dashboard 中进入你的 Worker：

```text
Workers & Pages -> personal-askbox -> Settings -> Domains & Routes
```

添加你的自定义域名，例如：

```text
ask.example.com
```

如果域名 DNS 已经托管在 Cloudflare，一般可以直接绑定。

## 通过 GitHub 自动部署到 Cloudflare

如果希望每次 push 到 GitHub 后自动部署，可以使用 Cloudflare Workers Builds 或 GitHub Actions。

最简单的方式是：

1. 把项目推送到 GitHub。
2. 在 Cloudflare Dashboard 打开 `Workers & Pages`。
3. 选择 `Create application`。
4. 连接 GitHub 仓库。
5. Build command 填：

```bash
npm run cf:build
```

6. Deploy command 填：

```bash
npx wrangler deploy
```

7. 在 Cloudflare 项目的环境变量里设置：

```text
SITE_NAME
NEXT_PUBLIC_TURNSTILE_SITE_KEY
SESSION_SECRET
ADMIN_PASSWORD
TURNSTILE_SECRET_KEY
```

同时确认 D1、KV、R2 bindings 已经和 `wrangler.jsonc` 中一致。

## 部署到 Vercel

Vercel 可以运行这个项目，但不是最推荐路径。

原因是：Vercel 没有 Cloudflare Workers 的原生 bindings，所以项目会通过 Cloudflare REST API 访问 D1/KV。普通提问和后台回答可以工作；图片附件上传依赖 R2 binding，默认只在 Cloudflare Workers 部署中完整可用。

### 1. 导入 GitHub 仓库

在 Vercel 中选择：

```text
Add New Project -> Import Git Repository
```

Build command 使用默认值：

```bash
npm run build
```

### 2. 设置环境变量

在 Vercel Project Settings 里添加：

```env
SITE_NAME="个人提问箱"
SESSION_SECRET="换成一段很长的随机字符串"
ADMIN_PASSWORD="你的管理员密码"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="你的-turnstile-site-key"
TURNSTILE_SECRET_KEY="你的-turnstile-secret-key"
CLOUDFLARE_ACCOUNT_ID="你的-cloudflare-account-id"
CLOUDFLARE_API_TOKEN="你的-cloudflare-api-token"
CLOUDFLARE_D1_DATABASE_ID="你的-d1-database-id"
CLOUDFLARE_KV_NAMESPACE_ID="你的-kv-namespace-id"
```

Cloudflare API Token 至少需要能访问 D1 和 KV。建议单独创建一个权限尽量小的 token，不要使用全局 API Key。

### 3. 部署

保存环境变量后点击 Deploy。部署完成后，Vercel 会给你一个访问地址。

## 管理后台

部署完成后访问：

```text
https://你的域名/admin
```

使用 `ADMIN_PASSWORD` 登录。

后台可以：

- 查看待回答问题。
- 输入回答。
- 选择是否发布到首页。
- 查看已回答、已发布和全部问题。

## 修改网站名称

Cloudflare Workers 部署：

1. 修改 `wrangler.jsonc` 中的 `SITE_NAME`。
2. 重新部署：

```bash
npm run cf:deploy
```

Vercel 部署：

1. 修改 Vercel 环境变量 `SITE_NAME`。
2. 重新部署。

## 常见问题

### 提交问题时报错

请检查：

- D1 是否已经执行 `npm run db:remote` 初始化。
- `TURNSTILE_SECRET_KEY` 是否正确。
- Turnstile widget 是否包含当前域名。
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 是否已经设置。

### 后台无法登录

请检查：

- `ADMIN_PASSWORD` 是否设置在生产环境。
- `SESSION_SECRET` 是否设置在生产环境。
- 浏览器是否禁用了 Cookie。

### 上传图片失败

请检查：

- 是否使用 Cloudflare Workers 部署。
- R2 bucket 是否已经创建。
- `wrangler.jsonc` 中 `ASKBOX_R2` 的 bucket 名是否正确。

Vercel 默认不支持本项目的 R2 binding 附件上传。

### 部署后首页没有公开内容

这是正常的。问题提交后默认进入后台收件箱，只有管理员回答并发布后，才会显示在首页。

### 本机 Windows 构建失败

如果本机执行 `npm run build` 时遇到 Next.js SWC DLL 相关错误，通常是 Windows 原生 SWC 模块加载问题，不是页面代码错误。项目已经在 `scripts/next.mjs` 中处理了 Windows fallback：当检测到 Windows 时，会自动使用 `@next/swc-wasm-nodejs`。

如果你仍然看到 `@next/swc-wasm-nodejs was not installed`，请在项目根目录重新安装依赖：

```bash
npm install
npm run build
```

如果仍然失败，请删除旧依赖后重装：

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run build
```

也可以安装或修复 Microsoft Visual C++ Redistributable 2015-2022 x64，因为 Next.js 的原生 SWC DLL 依赖它。

类型检查可以运行：

```bash
npx tsc --noEmit
```

## 项目命令

```bash
npm run dev        # 本地开发
npm run build      # Next.js 构建
npm run cf:build   # Cloudflare OpenNext 构建
npm run cf:preview # 本地预览 Cloudflare Workers 产物
npm run cf:deploy  # 部署到 Cloudflare Workers
npm run db:local   # 初始化本地 D1
npm run db:remote  # 初始化远端 D1
```

## 安全建议

- 不要把 `.env.local` 提交到 GitHub。
- 生产环境一定要设置强密码。
- `SESSION_SECRET` 请使用长随机字符串。
- Cloudflare API Token 请只授予必要权限。
- 如果公开访问量较大，可以进一步增加更严格的限流规则。

## 更新项目

修改代码后提交到 GitHub：

```bash
git add .
git commit -m "Update askbox"
git push
```

如果使用 Cloudflare Workers 本地部署：

```bash
npm run cf:deploy
```
