# Berg 的简历 / Berg's resume

中英文双语简历网站，基于 [BartoszJarocki/cv](https://github.com/BartoszJarocki/cv) 的极简模板改写，计划部署到 [resume.guoyibo.top](https://resume.guoyibo.top)。主站 [guoyibo.top](https://guoyibo.top) 不受影响。

保留原项目的 MIT 许可证。

- 中文：`/zh`
- English: `/en`
- 根路径 `/` 会转到 `/zh`（Cloudflare Pages 用 `_redirects`；静态导出后的 `out/index.html` 也会跳转，方便本地预览）

## 本地预览

需要 Node 22.15 或更高版本，以及 pnpm。

```bash
pnpm install
pnpm dev
# 打开 http://localhost:3000/zh 或 http://localhost:3000/en
```

`pnpm dev` 时请直接打开 `/zh` 或 `/en`。根路径跳转是静态托管行为，开发服务器不一定提供。

```bash
pnpm check       # lint + format
pnpm typecheck
pnpm build       # 静态导出到 out/
pnpm verify      # 检查构建结果里的双语内容与链接
```

本地查看生产构建：

```bash
pnpm build
npx --yes serve out
# 打开 http://localhost:3000/ 会跳到中文，或直接打开 /zh、/en
```

## 怎么改内容

所有简历事实和文案都在 **`src/data/resume-data.ts`**：

- `FACTS`：姓名、站点地址、社交链接、日期和数字。两种语言共用，改一处即可。
- `EXPECTED_OPENCLAW_HIGHLIGHTS`：已确认的中英条目，供校验对照。
- `copy`：各语言的简介、标题和条目。数字请用 `FACTS` 插值，避免中英文不一致。

界面上的“打印 / 另存为 PDF”、栏目标题等用语在 `src/lib/i18n.ts`。

还没有确认的信息不要编造。空的区块（工作经历、教育、技能、地点、头像、邮箱、电话）会自动隐藏。以后要补充时：

- 教育：向 `education` 添加条目
- 正式工作：向 `work` 添加条目（这是雇佣经历，不要把客户项目写在这里）
- 项目：向 `projects` 添加条目，可带 `start` / `end`、`highlights`、可选链接
- 头像：把照片放到 `src/data/`，在对应语言的数据里加入 `avatar` 导入

改完后运行 `pnpm check`、`pnpm typecheck`、`pnpm build`、`pnpm verify`。

## 打印和 PDF

页面按 **A4** 排版。语言切换、打印按钮和命令菜单在打印时会隐藏。

请使用浏览器的 **打印 → 另存为 PDF**。页面上的“打印 / 另存为 PDF”会打开系统打印对话框，不是文件下载按钮。每种语言单独打开对应网址后再导出，即可得到该语言的 PDF。

## 部署到 Cloudflare Pages（resume.guoyibo.top）

本仓库使用 Next.js 的 `output: "export"`，构建结果是静态文件，可直接交给 Cloudflare Pages，无需服务器或付费工具。

1. 在 Cloudflare Pages 里导入这个 GitHub 仓库。
2. 构建设置：
   - Framework preset: 可选 None，或按静态站点配置
   - Build command: `pnpm install && pnpm build`
   - Build output directory: `out`
   - Node.js version: `22`（或 22.15+）
3. 把自定义域 `resume.guoyibo.top` 加到这个 Pages 项目。DNS 需要你在域名服务商处完成，本仓库不会改 `guoyibo.top` 主站。
4. `public/_redirects` 会把 `/` 转到 `/zh`。`public/_headers` 提供基础安全头。

本地 `pnpm dev` 仍是 Next 开发服务器，不是 Cloudflare 模拟器。以 `pnpm build` 后的 `out/` 为准。

### 静态托管的限制

- 不会按 `Accept` 或 `User-Agent` 在 `/` 上自动返回 Markdown 或纯文本。请使用：
  - `https://resume.guoyibo.top/zh/index.md`
  - `https://resume.guoyibo.top/zh/index.txt`
  - `https://resume.guoyibo.top/zh/llms.txt`
  - 英文把 `zh` 换成 `en`
- 分享图（Open Graph）只使用拉丁字母，因为构建未内置中文字体，以避免远程字体导致构建失败。中文页的分享图会显示 “Berg” 和站点域名。

## 还需要人工确认的事项

- 用真机或浏览器看一遍中文和英文页，确认排版、字体和手机端显示。
- 用浏览器分别把 `/zh` 和 `/en` 存成 PDF，检查 A4、中文字体和控件是否已隐藏。
- 部署前再核对 DNS 只指向简历子域。
- 旧简历里的教育、工作等信息确认后再补进 `src/data/resume-data.ts`。

## License

MIT. This site is adapted from [BartoszJarocki/cv](https://github.com/BartoszJarocki/cv). The original license text is in `LICENSE`.
