# 晋浩宇 · 短视频剪辑手作品集

基于 React + Vite 的个人作品集网站，红黑树脂星系背景，暗色、克制、编辑感，面向 PC 端展示（版心 1700px）。

**在线地址：https://octopus678.github.io/**（手机、任何电脑均可访问）

## 运行

```bash
npm install
npm run dev        # 本地预览 http://127.0.0.1:5173
npm run build      # 生产构建
```

## 页面结构

1. 全屏 Hero：红黑漩涡背景（极慢 Ken Burns 缩放）、大标题、导航栏、联系按钮、平台跑马灯
2. 关于我：个人介绍、数据统计、工作经历时间线、联系方式 + 「现场照片」浅色编辑面板（11 张照片自动轮播，可暂停、点击站内查看大图）
3. 精选作品：4 支 9:16 竖屏成片组成的 **3D 环形轮播**（持续旋转、可暂停/继续、悬停自动暂停、点击卡片在站内全屏打开播放）
4. 个人优势：6 张能力卡片
5. 收尾联系页：整屏 CTA + 联系方式 + 页脚

设计拆解与生成提示词见 [DESIGN_PROMPT.md](DESIGN_PROMPT.md)（中英双语）。

## 内容替换指引

- **简历数据**：`src/components/About.jsx`（统计、经历、联系方式）、`src/components/Strengths.jsx`（优势文案）
- **个人照片**：覆盖 `public/photos/p1.jpg … p11.jpg`（11 张，建议竖图、宽度 ≥ 1400px）
- **作品视频**：覆盖 `public/videos/jingzong1.mp4 / pingge2.mp4 / huizi.mp4 / liyunya1.mp4`（及同名 .jpg 封面），建议 9:16、720p、H.264 + faststart
- **背景图**：覆盖 `public/bg.jpg`（建议深色、竖构图、宽度 ≥ 1200px）
- **主题色**：在 `src/index.css` 的 `--accent` 变量处修改

## 常用命令

- 开发：`npm run dev`
- 构建：`npm run build`
- 预览构建产物：`npm run preview`
- **发布更新：`npm run deploy`**（构建后自动同步源码并部署到 GitHub Pages，不依赖 git push）

## 部署说明

网站托管在 GitHub Pages（账号 Octopus678），首次部署已完成。以后修改内容后，在
`F:\VScode\portfolio` 目录执行 `npm run deploy` 即可自动更新线上版本（约 1 分钟生效）。
