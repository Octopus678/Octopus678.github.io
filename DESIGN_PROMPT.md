# 作品集网页 · 设计拆解与生成提示词
# Portfolio Website — Design Breakdown & Generation Prompt

> 本文件由参考素材拆解而来，可直接作为生成前端网页的设计提示词（中/英双语）。

---

## 一、参考拆解 / Reference Breakdown

### 1. Godly #44（深色数字代理官网）

来源：cdn.godly.design/posts/44.mp4

- 技术栈：类 React/Vue SPA（模块化打包），CSS 自定义属性主题，IntersectionObserver 滚动驱动动画，`video loop muted playsinline preload="metadata"` 懒加载媒体。
- 画面风格：近黑底（#0a0a0a / #181818）+ 白色大字 + 单个强调色，克制、高级、编辑感。
- 排版布局：双栏「编辑式大标题」（左栏 Digital solutions / 右栏 that drive your business forward），大留白，横向网格，低信息密度。
- 交互逻辑：滚动触发内容淡入上移；悬停卡片细微缩放（scale 1.015）；视频/图片卡片点击后在**站内弹层**（fixed inset-0、bg-black/90、backdrop-blur、右上角关闭按钮、max-w-7xl / max-h-92vh、rounded-2xl）中播放，**不跳转页面**。
- 交互动效：缓动 cubic-bezier(0.22, 1, 0.36, 1)，时长 500–900ms；滚动进入视口才触发；悬停 transition 300–500ms；中央视觉区有淡入/位移式 reveal。
- 图片元素：大比例视频封面（约 16:10），卡片内联播放，边框圆角，深底浅字对比。

### 2. Godly #159（浅色视觉型站点）

来源：cdn.godly.design/posts/159.mp4

- 画面风格：米白/浅灰底（#f8f8f8 / #e8e8e8）+ 陶土红/砖红暖色点缀（#b84818 / #a86848），温暖、编辑、画廊感。
- 排版布局：满屏大视觉，文字极少；大标题穿插于画面上下；照片/视觉为主角。
- 交互逻辑：中央媒体持续过渡/变换（连续流动），滚动时视觉跟随，照片大图优先。
- 图片元素：全幅展示大图，干净留白，暖色调影像。

### 3. Pinterest 背景图（pin 54043264275743705）

红黑「树脂星系漩涡」抽象画：近黑底 + 红色旋涡纹理 + 白/银 glitter 点缀。
用法：全站固定背景，叠加 70–85% 黑色渐变遮罩保证文字可读性，可加极慢的 Ken Burns 缩放让背景有呼吸感。

### 4. X @markovurnek_（WebGL raymarching heightfield）

WebGL 着色器生成的 3D 高度场，**连续循环旋转**。交互：可自主暂停/继续旋转，可**点击打开查看**（站内全屏查看，不跳转）。

---

## 二、生成提示词 / Generation Prompt

### English

Build a dark, premium portfolio website for a short-video editor using React + Vite.

- Background: fixed full-screen image of a red-and-black resin galaxy swirl, covered with a 70–85% black gradient overlay for readability; add an extremely slow Ken Burns zoom.
- Tech stack: React + Vite, plain CSS with custom properties, IntersectionObserver-driven reveal-on-scroll animations, no heavy animation libraries; use cubic-bezier(0.22, 1, 0.36, 1) easing and 500–900ms durations.
- Layout: desktop-first, content max-width about 1700px, generous whitespace, editorial two-column hero headline; structure: full-screen Hero → About (portrait photo showcase) → Works (rotating video carousel) → Strengths (card grid) → full-screen closing contact.
- Hero: full viewport, big two-line headline (e.g. "剪辑，是一种叙事。"), fixed navigation with blur-on-scroll, primary contact CTA, subtle platform marquee at the bottom.
- Photo showcase (About): replicates 素材1 / Godly #159 — a cream background with a large rounded dark device frame in the center, **all photos stacked in a vertical strip that scrolls continuously inside the 9:19 screen** (like a feed), huge outlined words scrolling vertically in the background (e.g. 节奏。叙事。留白。), a small caption, and dot navigation (dots jump the scroll); hovering pauses the scroll; clicking a photo opens an in-page lightbox (no navigation).
- Video showcase (Works): replicates the X post's WebGL form — a pure-black scene with a glowing 3D four-sided prism in the center, each face playing one 9:16 video, the prism rotating continuously in place with a breathing glow; a pause/play control stops the rotation, hovering a face pauses it, and clicking a face opens an in-page full-screen modal (fixed inset-0, dark blurred backdrop, close button, ESC to close) with sound — no page navigation.
- Strengths: six minimal cards with numbered labels, thin borders, hover accent underline.
- Closing: full-viewport CTA section over the same red-black background, phone/email links, footer with copyright and back-to-top.
- Motion principles: restrained — scroll-reveal, hero entrance line masks, ring rotation, hover micro-interactions (scale 1.015–1.03, accent underline); respect prefers-reduced-motion.
- Copy: bilingual-ready (Chinese primary), editor-specific, no live-streaming / 直播 content.

### 中文

用 React + Vite 搭建一个暗色、高级、克制的短视频剪辑师个人作品集网站。

- 背景：固定整屏使用「红黑树脂星系漩涡」图片，叠加 70–85% 黑色渐变遮罩保证文字可读，并加极慢的 Ken Burns 缩放营造呼吸感。
- 技术栈：React + Vite；纯 CSS 自定义属性做主题；用 IntersectionObserver 驱动滚动显现动画，不引重型动画库；缓动统一 cubic-bezier(0.22, 1, 0.36, 1)，时长 500–900ms。
- 排版：PC 优先，内容版心约 1700px，大量留白，编辑式双栏大标题；结构为 全屏 Hero → 关于（人像照片展）→ 作品（旋转视频轮播）→ 优势（卡片栅格）→ 整屏收尾联系页。
- Hero：整屏；两行大标题（如「剪辑，是一种叙事。」）；固定导航滚动后加毛玻璃；主 CTA 联系按钮；底部平台跑马灯。
- 人像照片展（关于）：复刻素材1 / Godly #159 —— 米白底 + 中央大圆角深色「设备屏」（9:19），**全部照片连成竖条在屏内持续滚动**（类似信息流），背景超大描边字竖排滚动（如「节奏。叙事。留白。」）+ 极简说明与圆点导航（圆点可跳转）；悬停暂停滚动；点击照片在**站内弹层**中查看，不跳转。
- 视频展（作品）：复刻 X 帖 WebGL 形式 —— 纯黑场景 + 中央发光四棱柱，每个面播放一支 9:16 视频，棱柱**原地持续旋转**并带呼吸光晕；暂停/继续按钮控制旋转，悬停面自动暂停，**点击面在站内全屏弹层**（固定全屏、深色毛玻璃背景、右上关闭、ESC 关闭）中带声音播放，不跳转页面。
- 优势：六张极简卡片，带编号、细边框、悬停强调色下划线。
- 收尾页：整屏 CTA，沿用红黑背景，电话/邮箱链接，页脚版权与回到顶部。
- 动效原则：克制——只保留入场遮罩、滚动显现、环带旋转、悬停微交互（scale 1.015–1.03、强调色下划线）；支持 prefers-reduced-motion。
- 文案：中英双语就绪（中文为主），内容为剪辑师定制，**不含直播/中控/助播相关内容**。

---

## 三、落地实现 / Implementation Notes

- 媒体：背景图 public/bg.jpg；个人照片 public/photos/p1.jpg … p11.jpg；竖屏视频 public/videos/*.mp4（H.264, yuv420p, faststart, 720p, 静音轮播 / 弹层带声）。
- 弹层复用同一组件：照片弹层与视频弹层共用样式（position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.9); backdrop-filter:blur(12px)）。
- 旋转视频柱：.prism{transform-style:preserve-3d; animation:prism-spin 38s linear infinite}，每面 rotateY(i·90deg) translateZ(200px)，暂停用 animation-play-state:paused。
