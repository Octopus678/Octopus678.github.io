/**
 * 扫描 public/ 生成资源体积清单，供开场加载页计算真实进度使用。
 * 每次 vite build 前自动执行（见 vite.config.js 插件）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const outFile = path.join(root, "src", "components", "Intro", "assetSizes.json");

export function collectSizes() {
  const sizes = {};
  const walk = (dir, rel) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(full, relPath);
      else if (/\.(mp4|webm|jpg|jpeg|png|webp|svg|glb|gif|avif|mp3|woff2?)$/i.test(entry.name)) {
        sizes[`/${relPath}`] = fs.statSync(full).size;
      }
    }
  };
  walk(publicDir, "");
  return sizes;
}

export function writeAssetSizes() {
  const sizes = collectSizes();
  fs.writeFileSync(outFile, `${JSON.stringify(sizes, null, 2)}\n`);
  const total = Object.values(sizes).reduce((a, b) => a + b, 0);
  return { count: Object.keys(sizes).length, total };
}

if (process.argv[1] && process.argv[1].endsWith("gen-asset-sizes.mjs")) {
  const { count, total } = writeAssetSizes();
  console.log(`assetSizes.json: ${count} files, ${(total / 1024 / 1024).toFixed(1)} MB`);
}
