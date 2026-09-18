import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import GridScanBg from "./GridScanBg";
import HammerStrike from "./HammerStrike";
import ASSET_SIZES from "./assetSizes.json";
import "./Intro.css";

/* 站内需要预先加载完的素材（与 public/videos 实际文件对应） */
const HEAD_SLUGS = [
  "worldnews",
  "sep2",
  "interview",
  "finance2",
  "outro",
  "fengdu",
  "politics",
  "liveclip",
  "qixue",
  "tcm1",
  "tcm2",
  "flyco",
  "finance1",
  "finance3"
];
const REEL_SLUGS = HEAD_SLUGS.map((s) => `reel-${s}`);

const MIN_SHOW_MS = 2200;
const CONCURRENCY = 6;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smoothstep = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1e-6));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

const supportsWebm = () => {
  try {
    const v = document.createElement("video");
    return v.canPlayType('video/webm; codecs="vp9"') !== "";
  } catch {
    return false;
  }
};

/* 收集整站素材：DOM 里出现的图片/视频封面/视频源 + 明确的视频清单 */
const collectAssets = () => {
  const urls = new Set();
  const add = (u) => {
    if (!u || u.startsWith("data:") || u.startsWith("blob:")) return;
    urls.add(u);
  };

  document.querySelectorAll("img[src]").forEach((el) => add(el.getAttribute("src")));
  document.querySelectorAll("video[poster]").forEach((el) => add(el.getAttribute("poster")));
  document.querySelectorAll("video[src]").forEach((el) => add(el.getAttribute("src")));
  document.querySelectorAll("video source[src]").forEach((el) => add(el.getAttribute("src")));

  add("/bg.jpg");
  add("/logo.svg");

  const all = [...HEAD_SLUGS, ...REEL_SLUGS];
  all.forEach((slug) => {
    const bust = slug === "outro" ? "?v=3" : "";
    add(`/videos/${slug}.jpg${bust}`);
    add(`/videos/${slug}.webm${bust}`);
    add(`/videos/${slug}.mp4${bust}`);
  });

  /* 同一支视频同时有 webm / mp4 时只下浏览器真正会用到的那个 */
  const list = [...urls];
  const webm = supportsWebm();
  return list.filter((u) => {
    const m = u.match(/^(.*)\.(webm|mp4)(\?.*)?$/);
    if (!m) return true;
    const [, base, ext] = m;
    if (webm) return ext !== "mp4" || !list.some((x) => x.startsWith(`${base}.webm`));
    return ext !== "webm" || !list.some((x) => x.startsWith(`${base}.mp4`));
  });
};

const runPool = async (items, worker, limit) => {
  let cursor = 0;
  const runners = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (cursor < items.length) {
      const i = cursor;
      cursor += 1;
      await worker(items[i], i);
    }
  });
  await Promise.all(runners);
};

/* 体积来自构建期生成的清单，省掉一轮 HEAD 请求，进度可以立刻开始走 */
const sizeOf = (url) => ASSET_SIZES[url.split("?")[0]] || 0;

const streamAsset = async (url, onBytes) => {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`${res.status}`);
  if (!res.body || !res.body.getReader) {
    const buf = await res.arrayBuffer();
    onBytes(buf.byteLength);
    return;
  }
  const reader = res.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onBytes(value ? value.length : 0);
  }
};

export default function Intro({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("loading");
  const [hammerMounted, setHammerMounted] = useState(true);
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const contentRef = useRef(null);
  const progressRef = useRef(0);
  const pausedVideosRef = useRef([]);
  const finishedRef = useRef(false);
  const lastReportRef = useRef(0);

  const setBoth = useCallback((value) => {
    progressRef.current = value;
    setProgress(value);
  }, []);

  /* 开场：锁滚动、暂停主站视频，避免和加载争资源 */
  useEffect(() => {
    window.scrollTo(0, 0);
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    document.body.classList.add("intro-open");
    /* 重负载页面下：允许补帧，但单帧最多补 120ms，避免转场被一次性跳过 */
    gsap.ticker.lagSmoothing(400, 120);

    const paused = [];
    document.querySelectorAll("video").forEach((v) => {
      if (!v.paused) {
        paused.push(v);
        v.pause();
      }
    });
    pausedVideosRef.current = paused;

    return () => {
      html.style.overflow = prevOverflow;
      document.body.classList.remove("intro-open");
      gsap.ticker.lagSmoothing(500, 33);
      pausedVideosRef.current.forEach((v) => v.play().catch(() => {}));
    };
  }, []);

  /* 真实加载进度：先量体积，再按字节统计 */
  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();

    const run = async () => {
      const list = collectAssets();
      const sizes = list.map((url) => sizeOf(url) || 900 * 1024);
      const total = sizes.reduce((a, b) => a + b, 0);

      let loaded = 0;
      const report = (force = false) => {
        if (cancelled) return;
        const now = performance.now();
        if (!force && now - lastReportRef.current < 120) return;
        lastReportRef.current = now;
        const ratio = total > 0 ? clamp01(loaded / total) : 0;
        setBoth(ratio);
      };
      report(true);

      await runPool(
        list,
        async (url, index) => {
          if (cancelled) return;
          const size = sizes[index] || 0;
          let fileBytes = 0;
          try {
            await streamAsset(url, (n) => {
              fileBytes += n;
              loaded += n;
              report();
            });
          } catch {
            /* 单个素材失败不阻塞整体进度 */
          }
          if (fileBytes < size) {
            loaded += size - fileBytes;
            report(true);
          }
        },
        CONCURRENCY
      );

      if (cancelled) return;

      /* 字体与首帧渲染 */
      try {
        await document.fonts?.ready;
      } catch {
        /* noop */
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const elapsed = performance.now() - startedAt;
      if (elapsed < MIN_SHOW_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_SHOW_MS - elapsed));
      }
      if (cancelled) return;
      setBoth(1);
      setPhase("ready");
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [setBoth]);

  /* 加载完成后：锤子落最后一击 → 让位给按钮 */
  useEffect(() => {
    if (phase !== "ready") return undefined;
    const timer = setTimeout(() => setHammerMounted(false), 950);
    return () => clearTimeout(timer);
  }, [phase]);

  /* 点击「精彩继续」：用 ScrollExpand 的展开语言做转场 */
  const handleStart = useCallback(() => {
    if (phase !== "ready" || finishedRef.current) return;
    finishedRef.current = true;
    setPhase("exiting");

    const site = document.querySelector(".site-root");
    const state = { p: 0 };

    const finish = () => {
      if (site) gsap.set(site, { clearProps: "transform,opacity,transformOrigin" });
      document.documentElement.style.overflow = "";
      document.body.classList.remove("intro-open");
      pausedVideosRef.current.forEach((v) => v.play().catch(() => {}));
      pausedVideosRef.current = [];
      onDone?.();
    };

    const tl = gsap.timeline({ onComplete: finish, defaults: { overwrite: "auto" } });

    if (site) {
      gsap.set(site, { transformOrigin: "50% 0%", transform: "scale(1.35)", opacity: 0 });
      tl.to(site, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0);
      tl.to(site, { scale: 1, duration: 1.25, ease: "power2.inOut" }, 0);
    }

    tl.to(
      state,
      {
        p: 1,
        duration: 1.25,
        ease: "power2.inOut",
        onUpdate: () => {
          const e = smoothstep(0, 1, state.p);
          const w = lerp(100, 42, e);
          const h = lerp(100, 58, e);
          const ix = Math.max(0, (100 - w) / 2);
          const iy = Math.max(0, (100 - h) / 2);
          const r = lerp(0, 26, e);
          if (frameRef.current) {
            frameRef.current.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;
          }
          if (contentRef.current) {
            contentRef.current.style.transform = `scale(${lerp(1, 1.14, e)})`;
            contentRef.current.style.opacity = `${1 - smoothstep(0.35, 0.92, state.p)}`;
          }
        }
      },
      0
    );
  }, [onDone, phase]);

  const pct = Math.round(progress * 100);

  return (
    <div className={`intro intro--${phase}`} ref={rootRef}>
      <div className="intro__frame" ref={frameRef}>
        <div className="intro__bg">
          <GridScanBg
            linesColor="#5f5468"
            scanColor="#ff6a3d"
            scanOpacity={0.72}
            gridScale={0.12}
            lineJitter={0.12}
            lineThickness={1.15}
            scanGlow={1.15}
            scanSoftness={2.2}
            scanDuration={2.2}
            scanDelay={1.5}
            noiseIntensity={0.015}
          />
          <span className="intro__vignette" aria-hidden="true" />
        </div>

        <div className="intro__content" ref={contentRef}>
          <div className="intro__brand">
            JIN HAOYU <span>/</span> 短视频剪辑
          </div>
          <div className="intro__stage">
            {hammerMounted ? (
              <div className={`intro__hammer ${phase === "loading" ? "is-on" : "is-off"}`}>
                <HammerStrike active={phase === "loading"} progress={progress} />
              </div>
            ) : null}

            <button
              type="button"
              className={`intro__btn ${phase === "ready" ? "is-on" : ""}`}
              onClick={handleStart}
              aria-label="精彩继续，进入网站"
            >
              精彩继续
            </button>
          </div>

          <div className={`intro__progress ${phase === "loading" ? "" : "is-hidden"}`}>
            <div
              className="loader"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label="加载进度"
            >
              <div className="loading-text">
                Loading
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="intro__pct">{pct}%</span>
              </div>
              <div className="loading-bar-background">
                <div className="loading-bar" style={{ width: `${progress * 100}%` }}>
                  <div className="white-bars-container">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div className="white-bar" key={i} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
