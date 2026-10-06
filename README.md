# 网站定制 · 案例 Demo

闲鱼「网站定制」商品的 3 个展示案例。纯静态站点，**零外部依赖**（不用 CDN、不用外部字体和图片，国内访问稳定），本地双击 `index.html` 即可打开，也可以直接部署到任意静态托管。

| 站点 | 定位 | 在线访问 |
| --- | --- | --- |
| 案例总览 | 一个链接看全部案例，适合直接发给客户 | <https://luyongkang777.github.io/web-demos/> |
| [demo-1-portfolio](demo-1-portfolio/) | 个人主页 / 简历站（¥39 基础版引流款） | <https://luyongkang777.github.io/web-demos/demo-1-portfolio/> |
| [demo-2-landing](demo-2-landing/) | 企业落地页（¥99~299 利润款） | <https://luyongkang777.github.io/web-demos/demo-2-landing/> |
| [demo-3-homework](demo-3-homework/) | 学生网页作业模板，5 页（¥39~80 走量款） | <https://luyongkang777.github.io/web-demos/demo-3-homework/> |

---

## 本地预览

- **最简单**：双击各目录下的 `index.html`（所有功能在 `file://` 下均可用）。
- **本地服务器**（更接近线上效果）：在本目录执行任一命令，然后访问 `http://localhost:8000`
  ```bash
  python -m http.server 8000
  # 或
  npx serve .
  ```

## 部署

当前部署在 GitHub Pages（仓库根目录即站点根目录）。更新方法：修改文件 → `git commit` → `git push`，约 1 分钟后生效。

其他平台同样适用，均为免费：

- **Netlify Drop**：打开 <https://app.netlify.com/drop>，把整个文件夹（或单个 demo 文件夹）拖进去即可。
- **Vercel / Cloudflare Pages**：导入 Git 仓库，框架选 *Other / None*，构建命令留空，输出目录填 `/`（或某个 demo 目录）。

> 给客户交付单个站点时，只需打包对应的 `demo-x` 文件夹，它是自包含的。

## 交付前必改清单（每个站点通用）

1. **og:image 改为客户的绝对地址**：当前 `og:image` 指向本仓库的 GitHub Pages 地址，换域名部署时改为 `https://客户域名/og.png`（微信、微博等分享卡片需要完整网址）。
2. **署名**：全局搜索替换 `拾页工作室` 为你的店铺名 / 工作室名（作业站点没有卖家署名，见下文）。
3. **页面标题与描述**：`<title>` 和 `<meta name="description">`。
4. **favicon.svg**：网站图标，可替换为客户的 Logo（SVG 或 PNG 均可）。

---

## 站点 1：个人主页 `demo-1-portfolio/`

**技术栈**：HTML + CSS + 原生 JS（无框架、无构建），约 100 KB（不含 og.png）。

**功能**：单页滚动 · 深色模式（右上角切换，`localStorage` 记忆，首次访问跟随系统）· 滚动渐入 · 数字滚动 · 技能进度条 · 作品详情弹窗（键盘 ←/→ 切换、Esc 关闭、手机端底部抽屉）· 经历时间线 · 微信二维码浮层（一键复制微信号）· 联系表单（前端校验 + 成功提示，不真实发送）· 移动端汉堡菜单 · 阅读进度条。

| 想改什么 | 在哪里改 |
| --- | --- |
| 主色 / 配色 | `style.css` 顶部 `:root`（浅色）和 `[data-theme="dark"]`（深色）。改 `--primary` / `--primary-2` 即可换主题色 |
| 字体 | `style.css` 的 `--font-sans` / `--font-serif` |
| 姓名、简介、经历、技能 | `index.html`，每个区块有 `<!-- ============ 名称 ============ -->` 注释 |
| 头像 | 替换 `images/avatar.svg`（换成照片：改 `<img src>` 为 `.jpg/.webp`，建议 480×560 比例） |
| 作品 | 每个 `<article class="work">` 一个作品：卡片封面在 `images/work-N.svg`（建议 4:3），弹窗详情写在同一个 `<article>` 里的 `<template>` 中 |
| 数据卡片数字 | `.count` 元素的 `data-to` 和文字内容一起改 |
| 微信号 / 二维码 | 微信号：`script.js` 中 `WECHAT_ID`，`index.html` 中 `EchoLin_design`；二维码：替换 `images/wechat-qr.svg`（**当前为不可扫描的占位图**） |
| 邮箱 / 社交链接 | `index.html` 联系区块，搜索 `hello@echolin.design` |

## 站点 2：企业落地页 `demo-2-landing/`

**技术栈**：HTML + CSS + 原生 JS（无框架、无构建）。产品界面截图、合作企业 Logo、功能插图均为 HTML/CSS/SVG 绘制，无图片文件。

**功能**：导航滚动毛玻璃（深色区 / 浅色区自动切换）+ 当前区块高亮 · 首屏产品界面 Mockup（随滚动由倾斜变平）· 合作企业 Logo（手机端自动滚动）· Bento 功能网格（每格带小动画）· 数字滚动动画 · 客户评价 · 价格表月付 / 年付切换（价格联动）· FAQ 手风琴 · 底部 CTA 邮箱表单 · 多列页脚。

| 想改什么 | 在哪里改 |
| --- | --- |
| 配色 | `style.css` 顶部 `:root`：`--brand-1/2/3`（品牌渐变）、`--navy-*`（深色区）、`--bg` 等。例如换成「品牌橙 + 米白」只需改这几组变量 |
| 价格 | `index.html` 中 `.plan__num` 的 `data-monthly` / `data-yearly`（元 / 人·月），`.plan__note` 的 `data-note-monthly` / `data-note-yearly` |
| 数据数字 | `.count-up` 的 `data-to`（终值）、`data-decimals`（小数位）、`data-from`（起始值），同时改元素内文字（无 JS 时显示） |
| 合作企业 Logo | 信任条区块。**Logo 行写了两份**（手机端无缝滚动用），改一处要同步另一处 |
| 图标 | `<body>` 顶部的 SVG sprite，用 `<use href="#i-xxx">` 引用 |
| 中文标题断行 | 长标题拆成 `<span class="nw">短语</span>`，只在短语之间换行，改文案时沿用此写法 |

## 站点 3：学生网页作业 `demo-3-homework/`（主题：中国茶文化）

**技术栈**：原生 HTML + CSS + JS，**不使用任何框架和库**，语义化标签，Flexbox / Grid 布局，**全部代码带中文注释**（方便学生讲解）。

**页面**：`index.html` 首页（轮播图 + 主题介绍 + 推荐卡片）· `about.html` 茶史详情（左右交错图文）· `gallery.html` 图集（分类筛选 + 灯箱）· `list.html` 名茶列表（筛选 + 搜索，手机端表格变卡片）· `contact.html` 留言（表单验证 + 成功提示）。

**JS 交互**：轮播图（自动播放、左右切换、圆点、悬停暂停、手机滑动）· 灯箱（上一张 / 下一张、Esc 关闭）· 表单验证（中文错误提示）· 列表筛选与搜索 · 回到顶部 · 移动端导航。

| 想改什么 | 在哪里改 |
| --- | --- |
| 配色 / 字体 | `css/style.css` 顶部 `:root` |
| 图片 | `images/` 下的 SVG 插画，可替换为同名 `.jpg`（同时改 HTML 中的 `src` 后缀） |
| 页脚学生信息 | 每个页面底部：课程名、姓名、学号（占位符，交作业前必须改） |
| 交互逻辑 | `js/main.js`，每个功能是一个独立函数，函数开头有中文说明 |

> 作业站点不放卖家署名，避免学生交作业时出现第三方信息。

---

## 目录结构

```
├── index.html            案例总览页（发给客户的入口）
├── demo-1-portfolio/     个人主页
├── demo-2-landing/       企业落地页
├── demo-3-homework/      学生作业（5 页）
└── .tools/               本地截图与自动化测试脚本（仅保存在本机，不上传仓库）
```

## 质量验证

每个站点都经过 Edge 无头浏览器自动检查（本机 `.tools/` 目录中的脚本，未上传仓库）：

- 375 / 768 / 1440 三种宽度逐屏截图人工检查，无横向溢出、无控制台报错；
- 交互自动化测试：在 `.tools` 目录执行 `node test-portfolio.js` / `node test-landing.js` / `node test-homework.js`；
- 页面布局检查：`node check.js ../demo-1-portfolio/index.html --chunks`，截图输出到 `.tools/shots/`。
