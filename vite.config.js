import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeAssetSizes } from "./scripts/gen-asset-sizes.mjs";

/* 构建前刷新素材体积清单，开场加载页据此计算真实进度 */
const assetManifestPlugin = () => ({
  name: "asset-size-manifest",
  buildStart() {
    const { count, total } = writeAssetSizes();
    this.info(`assetSizes.json: ${count} files, ${(total / 1024 / 1024).toFixed(1)} MB`);
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [assetManifestPlugin(), react()],
  assetsInclude: ["**/*.glb"],
  server: {
    host: true, // 监听 0.0.0.0，允许同一网络下的手机/电脑访问
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
