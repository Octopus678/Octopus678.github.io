import { useEffect, useState } from "react";
import MoltenMetal from "./MoltenMetal/MoltenMetal";

const MARQUEE_WORDS = [
  "抖音",
  "快手",
  "小红书",
  "视频号",
  "美团",
  "对标拆解",
  "二次创作",
  "全流程交付",
  "数据复盘",
];

// 全部 14 支成片：melius 风格画布排布（x/y 为百分比，w 为宽度 px，ar 为宽高比）
const TILES = [
  { file: "interview", label: "访谈", x: 60, y: 15, w: 210, ar: 0.75, r: -4, dim: 1 },
  { file: "tcm1", label: "中医科普", x: 76, y: 36, w: 250, ar: 1, r: 3, dim: 1 },
  { file: "fengdu", label: "丰都鬼城", x: 91, y: 12, w: 170, ar: 0.62, r: 6, dim: 0.95 },
  { file: "politics", label: "时政解读", x: 68, y: 62, w: 230, ar: 1.6, r: -3, dim: 1 },
  { file: "finance1", label: "财经解读", x: 86, y: 72, w: 190, ar: 0.75, r: 4, dim: 0.95 },
  { file: "liveclip", label: "直播切片", x: 50, y: 84, w: 200, ar: 1.4, r: -5, dim: 0.9 },
  { file: "qixue", label: "气血离居", x: 36, y: 6, w: 165, ar: 0.72, r: 5, dim: 0.8 },
  { file: "flyco", label: "飞科产品细节", x: 12, y: 80, w: 195, ar: 1.3, r: -6, dim: 0.85 },
  { file: "outro", label: "结束宣传片", x: 4, y: 40, w: 150, ar: 0.8, r: 4, dim: 0.7 },
  { file: "worldnews", label: "国际时政", x: 26, y: 92, w: 150, ar: 1, r: -3, dim: 0.8 },
  { file: "sep2", label: "作品", x: 96, y: 52, w: 140, ar: 0.7, r: -6, dim: 0.9 },
  { file: "finance2", label: "财经解读", x: 58, y: 95, w: 165, ar: 1.5, r: 5, dim: 0.85 },
  { file: "tcm2", label: "中医科普", x: 44, y: 26, w: 180, ar: 1.2, r: 3, dim: 0.6 },
  { file: "finance3", label: "财经解读", x: 30, y: 55, w: 170, ar: 0.8, r: -4, dim: 0.55 },
];

export default function Hero() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="top" className={`hero ${scrolled ? "hero--scrolled" : ""}`}>
      <div className="hero-bg" aria-hidden="true">
        <img src="/bg.jpg" alt="" />
      </div>
      <div className="hero-molten" aria-hidden="true">
        <MoltenMetal
          color1="#2a0802"
          color2="#ff5a36"
          color3="#ffd9b0"
          speed={0.4}
          scale={3.4}
          detail={3}
          glow={1.9}
          coreSize={0.12}
          swirl={1.1}
          fold={-0.25}
          blackPoint={0.14}
          brightness={1.15}
          colorMode="ember"
          grain
          grainIntensity={0.06}
          mouseInteraction
          mouseStrength={0.25}
          opacity={0.5}
        />
      </div>

      {/* melius 风格：全部成片在头部画布中循环播放（不可点击） */}
      <div className="video-canvas" aria-hidden="true">
        {TILES.map((t, i) => (
          <div
            key={t.file}
            className="v-tile"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: `${t.w}px`,
              aspectRatio: `${t.ar}`,
              transform: `translate(-50%, -50%) rotate(${t.r}deg)`,
              opacity: t.dim,
              zIndex: 2,
              animationDelay: `${(i % 7) * 1.3}s`,
            }}
          >
            <video
              poster={`/videos/${t.file}.jpg`}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
            >
              <source src={`/videos/${t.file}.webm`} type="video/webm" />
              <source src={`/videos/${t.file}.mp4`} type="video/mp4" />
            </video>
          </div>
        ))}
      </div>

      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-scan" aria-hidden="true" />

      <div className="container hero-inner">
        <div className="hero-kicker">
          <span className="rec">
            <i aria-hidden="true" />
            REC
          </span>
          <span>SHORT-FORM VIDEO EDITOR</span>
          <span aria-hidden="true">/</span>
          <span>NANJING · CN</span>
        </div>

        <h1 className="hero-title">
          <span className="row">
            <span style={{ "--rd": "120ms" }}>剪辑，是</span>
          </span>
          <span className="row">
            <span style={{ "--rd": "260ms" }}>
              一种<span className="accent">叙事</span>
              <span className="outline">。</span>
            </span>
          </span>
        </h1>

        <p className="hero-sub">
          我是<strong>晋浩宇</strong>，短视频剪辑手。1 年新媒体实战经验，熟悉抖音 / 快手 /
          小红书 / 视频号 / 美团多平台内容生态。从<strong>脚本拆解</strong>、辅助拍摄到
          <strong>成片交付</strong>，让每一帧都为叙事服务。
        </p>

        <div className="hero-actions">
          <a href="#contact" className="btn-primary">
            聊聊合作
            <span aria-hidden="true">→</span>
          </a>
          <a href="#works" className="btn-ghost">
            <span>查看作品</span>
            <span className="arrow" aria-hidden="true">
              ↓
            </span>
          </a>
        </div>
      </div>

      <div className="hero-meta">
        <span className="spec">
          PLATFORMS — <b>DOUYIN / KUAISHOU / XHS / CHANNELS / MEITUAN</b>
        </span>
        <span className="spec">
          REEL — <b>14 支成片循环展映</b>
        </span>
        <span className="scroll-hint">
          <span className="line" aria-hidden="true" />
          SCROLL
        </span>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <span key={dup} style={{ display: "contents" }}>
              {MARQUEE_WORDS.map((word) => (
                <span key={`${dup}-${word}`}>{word}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
