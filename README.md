# 晋浩宇 · 短视频剪辑手作品集

基于 React + Vite 的个人作品集网站，暗色系、科技感、克制风格，面向 PC 端展示（版心 1700px）。

## 运行

```bash
npm install
npm run dev        # 本地预览 http://127.0.0.1:5173
npm run build      # 生产构建
```

## 页面结构

1. 全屏 Hero：动态粒子背景（放入 `public/hero.mp4` 后自动切换为视频背景）、大标题、导航栏、联系按钮
2. 关于我：头像位（当前为 JH 字母标识，可替换为真实照片）、个人介绍、数据统计、工作经历时间线、联系方式
3. 精选作品：大卡片展示 3 个项目（当前为占位视觉，后续替换为真实截图/视频）
4. 个人优势：6 张能力卡片
5. 收尾联系页：整屏 CTA + 联系方式 + 页脚

## 内容替换指引

- **简历数据**：`src/components/About.jsx`（统计、经历、联系方式）、`src/components/Works.jsx`（项目）、`src/components/Strengths.jsx`（优势文案）
- **头像照片**：将照片放入 `public/avatar.jpg`，替换 `src/components/About.jsx` 中 `.portrait` 区块内的字母标识
- **Hero 视频背景**：将视频命名为 `hero.mp4` 放入 `public/`，页面会自动播放（自动判断，无需改代码）
- **作品图**：替换 `src/components/Works.jsx` 中每张卡片的占位视觉，建议 16:9 / 21:8 大图
- **主题色**：在 `src/index.css` 的 `--accent` 变量处修改

## 常用命令

- 开发：`npm run dev`
- 构建：`npm run build`
- 预览构建产物：`npm run preview`
