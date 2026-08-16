/**
 * 通过 GitHub API 部署网站。
 * - main 分支 = 构建后的成品（用户主页站点只能从 main 发布）
 * - source 分支 = 源码备份
 * 不依赖 git push，国内网络访问 github.com 被重置时依然可用。
 * 用法：npm run deploy（或设置 GH_TOKEN 后 node scripts/deploy-gh.mjs）
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OWNER = "Octopus678";
const REPO = "Octopus678.github.io";
const AUTHOR = { name: "Octopus678", email: "pidtiy@163.com" };

const token =
  process.env.GH_TOKEN || execSync("gh auth token", { encoding: "utf8" }).trim();
const api = `https://api.github.com/repos/${OWNER}/${REPO}`;
const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

async function gh(method, url, body) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.ok || res.status === 404 || res.status === 204) {
      return res.status === 204 ? null : res.status === 404 ? null : res.json();
    }
    if (attempt < 3) {
      const wait = 2000 * 2 ** attempt;
      console.log(`重试 ${method} ${url.split("/").pop()} (${res.status})，${wait / 1000}s 后...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new Error(`${method} ${url} -> ${res.status}: ${await res.text()}`);
  }
}

function collectFiles(dir, skip = []) {
  const out = [];
  const walk = (cur, rel) => {
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (skip.includes(entry.name)) continue;
      if (entry.isDirectory()) walk(full, relPath);
      else out.push({ path: relPath.replace(/\\/g, "/"), full });
    }
  };
  walk(dir, "");
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

async function commitTree(files, message, parentSha) {
  const blobs = [];
  for (const f of files) {
    const content = f.full ? fs.readFileSync(f.full).toString("base64") : "";
    const blob = await gh("POST", `${api}/git/blobs`, {
      content,
      encoding: "base64",
    });
    blobs.push({ path: f.path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const tree = await gh("POST", `${api}/git/trees`, { tree: blobs });
  const commit = await gh("POST", `${api}/git/commits`, {
    message,
    tree: tree.sha,
    parents: parentSha ? [parentSha] : [],
    author: AUTHOR,
    committer: AUTHOR,
  });
  return commit.sha;
}

async function updateRef(branch, sha) {
  const url = `${api}/git/refs/heads/${branch}`;
  const existing = await gh("GET", url);
  if (existing) {
    await gh("PATCH", url, { sha, force: false });
  } else {
    await gh("POST", `${api}/git/refs`, { ref: `refs/heads/${branch}`, sha });
  }
}

const mainRef = await gh("GET", `${api}/git/ref/heads/main`);
if (!mainRef) throw new Error("远程 main 分支不存在");
const mainSha = mainRef.object.sha;

// 1) 同步源码到 source 分支
const sourceFiles = collectFiles(root, [
  ".git",
  "node_modules",
  "dist",
  ".vscode",
  "vite-dev.log",
  "vite-dev.log.err",
]);
const sourceRef = await gh("GET", `${api}/git/ref/heads/source`);
console.log(`同步源码到 source：${sourceFiles.length} 个文件`);
const sourceCommit = await commitTree(
  sourceFiles,
  "chore: 同步源码",
  sourceRef ? sourceRef.object.sha : mainSha
);
await updateRef("source", sourceCommit);
console.log("source 分支已更新");

// 2) 部署 dist 到 main（用户主页站点只能从 main 发布）
const distDir = path.join(root, "dist");
if (!fs.existsSync(path.join(distDir, "index.html"))) {
  throw new Error("dist/index.html 不存在，请先执行 npm run build");
}
const distFiles = collectFiles(distDir);
distFiles.push({ path: ".nojekyll", full: null });
console.log(`部署到 main：${distFiles.length} 个文件`);
const mainCommit = await commitTree(
  distFiles,
  "deploy: 作品集更新",
  mainSha
);
await updateRef("main", mainCommit);
console.log("main 分支已更新（构建产物）");

// 3) 清理多余的 gh-pages 分支（避免混淆）
await gh("DELETE", `${api}/git/refs/heads/gh-pages`);
console.log("已清理 gh-pages 分支");

// 4) 等待构建完成
let pages = await gh("GET", `${api}/pages`);
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  pages = await gh("GET", `${api}/pages`);
  if (pages?.status === "built") break;
  if (pages?.status === "errored") throw new Error(`Pages 构建失败：${JSON.stringify(pages)}`);
  process.stdout.write(`构建中... (${pages?.status ?? "?"})\n`);
}

console.log("部署完成：", pages?.html_url ?? `https://${OWNER}.github.io`);
