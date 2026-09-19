import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import GridScanBg from "./GridScanBg";
import ASSET_SIZES from "./assetSizes.json";
import "./Intro.css";

/* 加载条里轮播的词（Uiverse fresh-lizard-20 的结构） */
const LOADER_WORDS = ["剪辑", "调色", "成片", "交付", "剪辑"];

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

/* 真正的“后面全部加载完毕”：等站内图片解码完成、视频缓冲到可播放 */
const waitForMedia = async (timeoutMs = 6000) => {
  const deadline = performance.now() + timeoutMs;
  const images = [...document.querySelectorAll("img[src]")];
  /* 先让视频按 auto 预载，字节早已在缓存里，这一步只是把它推进到可播放 */
  document.querySelectorAll("video").forEach((v) => {
    if (v.readyState < 2) {
      v.preload = "auto";
      try {
        v.load();
      } catch {
        /* noop */
      }
    }
  });
  /* eslint-disable no-await-in-loop */
  for (;;) {
    const pendingImages = images.filter((el) => !el.complete || el.naturalWidth === 0).length;
    const pendingVideos = [...document.querySelectorAll("video")].filter((v) => v.readyState < 2).length;
    if (!pendingImages && !pendingVideos) return { pendingImages, pendingVideos };
    if (performance.now() >= deadline) return { pendingImages, pendingVideos };
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  /* eslint-enable no-await-in-loop */
};

export default function Intro({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("loading");
  const [centerMounted, setCenterMounted] = useState(true);
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
      /* 图片 + 视频缓冲全部就绪后才允许点击进入 */
      await waitForMedia(6000);
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
    const timer = setTimeout(() => setCenterMounted(false), 950);
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
            linesColor="#574a70"
            scanColor="#a855f7"
            scanOpacity={0.75}
            gridScale={0.12}
            lineJitter={0.12}
            lineThickness={1.15}
            scanGlow={1.25}
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

          {/* 加载动画正上方：Elemental Lightning 风格的电光文字（不出现闪电） */}
          <p className="intro__charge">沟通无碍，尊重共见，成片至精</p>

          <div className="intro__stage">
            {centerMounted ? (
              <div className={`intro__mole ${phase === "loading" ? "is-on" : "is-off"}`}>
                <div className="loading-container">
                  <div className="ground" />
                  <div className="skeleton">
                    <div className="head">
                      <div className="eye left" />
                      <div className="eye right" />
                      <div className="mouth" />
                    </div>
                    <div className="body" />
                    <div className="arm left" />
                    <div className="arm right" />
                    <div className="leg left" />
                    <div className="leg right" />
                  </div>
                </div>
              </div>
            ) : null}

            <div className={`intro__btn-wrap ${phase === "ready" ? "is-on" : ""}`}>
              <button
                type="button"
                className="intro__btn"
                onClick={handleStart}
                disabled={phase !== "ready"}
                aria-label="精彩继续，进入网站"
              >
                <span className="dots_border" aria-hidden="true" />
                <svg
                  className="sparkle"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    className="path"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
                  />
                  <path
                    className="path"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
                  />
                  <path
                    className="path"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
                  />
                </svg>
                <span className="text_button">精彩继续</span>
              </button>
            </div>
          </div>

          <div className={`intro__progress ${phase === "loading" ? "" : "is-hidden"}`}>
            <div
              className="card"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-label="加载进度"
            >
              <div className="loader">
                <p>loading</p>
                <div className="words">
                  {LOADER_WORDS.map((word, i) => (
                    <span className="word" key={`${word}-${i}`}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <span className="intro__pct">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
