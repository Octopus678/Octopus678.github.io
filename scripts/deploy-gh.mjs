/**
 * 通过 GitHub API 部署 dist 到 gh-pages 分支并启用 GitHub Pages。
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
  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`${method} ${url} -> ${res.status}: ${await res.text()}`);
  }
  return res.status === 204 ? null : res.status === 404 ? null : res.json();
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
    const content = fs.readFileSync(f.full).toString("base64");
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

// 1) 同步源码到 main
const sourceFiles = collectFiles(root, [
  ".git",
  "node_modules",
  "dist",
  ".vscode",
  "vite-dev.log",
  "vite-dev.log.err",
]);
console.log(`同步源码到 main：${sourceFiles.length} 个文件`);
const mainCommit = await commitTree(
  sourceFiles,
  "chore: 同步源码",
  mainSha
);
await updateRef("main", mainCommit);
console.log("main 已更新");

// 2) 部署 dist 到 gh-pages
const distDir = path.join(root, "dist");
if (!fs.existsSync(path.join(distDir, "index.html"))) {
  throw new Error("dist/index.html 不存在，请先执行 npm run build");
}
const distFiles = collectFiles(distDir);
console.log(`部署到 gh-pages：${distFiles.length} 个文件`);
const pagesCommit = await commitTree(
  distFiles,
  "deploy: 作品集更新",
  mainCommit
);
await updateRef("gh-pages", pagesCommit);
console.log("gh-pages 已更新");

// 3) 启用/切换 Pages 来源
let pages = await gh("GET", `${api}/pages`);
const pagesBody = { source: { branch: "gh-pages", path: "/" } };
if (pages) {
  await gh("PATCH", `${api}/pages`, pagesBody);
} else {
  pages = await gh("POST", `${api}/pages`, pagesBody);
}

// 4) 等待构建完成
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  pages = await gh("GET", `${api}/pages`);
  if (pages?.status === "built") break;
  if (pages?.status === "errored") throw new Error(`Pages 构建失败：${JSON.stringify(pages)}`);
  process.stdout.write(`构建中... (${pages?.status ?? "?"})\n`);
}

console.log("部署完成：", pages?.html_url ?? `https://${OWNER}.github.io`);
