/**
 * 通过 GitHub API 部署网站。
 * - main 分支 = 构建后的成品（用户主页站点只能从 main 发布）
 * - source 分支 = 源码备份
 * 不依赖 git push，国内网络访问 github.com 被重置时依然可用。
 * 用法：npm run deploy（或设置 GH_TOKEN 后 node scripts/deploy-gh.mjs）
 */
import { execSync } from "node:child_process";
import crypto from "node:crypto";
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

function gitBlobSha(buf) {
  return crypto.createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");
}

async function gh(method, url, body, timeoutMs = 120000) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    let res;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: ctrl.signal,
      });
    } catch (e) {
      clearTimeout(timer);
      if (attempt < 3) {
        const wait = 2000 * 2 ** attempt;
        console.log(`网络异常重试 ${method} ${url.split("/").pop()} (${e.message.slice(0, 40)})，${wait / 1000}s 后...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw e;
    }
    clearTimeout(timer);
    if (res.ok || res.status === 404 || res.status === 204 || (method === "DELETE" && res.status === 422)) {
      return res.status === 204 || res.status === 404 || (method === "DELETE" && res.status === 422)
        ? null
        : res.json();
    }
    if (attempt < 5) {
      const wait = Math.min(2000 * 2 ** attempt, 30000);
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

async function remoteBlobShas() {
  const shas = new Set();
  for (const branch of ["main", "source"]) {
    try {
      const tree = await gh("GET", `${api}/git/trees/${branch}?recursive=1`, undefined, 30000);
      if (tree?.tree) for (const e of tree.tree) if (e.type === "blob") shas.add(e.sha);
    } catch {
      // 分支可能不存在，忽略
    }
  }
  return shas;
}

async function commitTree(files, message, parentSha) {
  // 并行、断点续传式上传 blob：先算 git 指纹，已存在于远程树则跳过
  const blobs = new Array(files.length);
  const CONCURRENCY = 4;
  let cursor = 0;
  async function worker() {
    while (cursor < files.length) {
      const i = cursor++;
      const f = files[i];
      const content = f.full ? fs.readFileSync(f.full) : Buffer.alloc(0);
      const sha = gitBlobSha(content);
      if (remoteShas.has(sha)) {
        blobs[i] = { path: f.path, mode: "100644", type: "blob", sha };
        continue;
      }
      const blob = await gh("POST", `${api}/git/blobs`, {
        content: content.toString("base64"),
        encoding: "base64",
      });
      blobs[i] = { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`  blobs: ${files.length} 个，已上传/复用`);
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
const remoteShas = await remoteBlobShas();
console.log(`远程已有对象：${remoteShas.size} 个`);

// 1) 同步源码到 source 分支
const sourceFiles = collectFiles(root, [
  ".git",
  "node_modules",
  "dist",
  ".vscode",
  "vite-dev.log",
  "vite-dev.log.err",
]).filter((f) => !/\.log(\.err)?$/i.test(f.path));
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
