import { useEffect, useState } from "react";
import MoltenMetal from "./MoltenMetal/MoltenMetal";
import ChromaZone from "./ChromaZone/ChromaZone";
import DepthText from "./DepthText/DepthText";

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

// 视频漂移墙（参考 React Bits DriftWall）：视频只分布在中部与右部，4 列上下交错漂移
const COLUMNS = [
  { dur: 46, reverse: false, tiles: ["interview", "fengdu", "finance1"] },
  { dur: 38, reverse: true, tiles: ["tcm1", "politics", "outro"] },
  { dur: 52, reverse: false, tiles: ["qixue", "liveclip", "tcm2", "flyco"] },
  { dur: 42, reverse: true, tiles: ["sep2", "worldnews", "finance2", "finance3"] },
];

const TITLE_SIZE = "clamp(2.4rem, 6.2vw, 6.9rem)";

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
          opacity={0.28}
        />
      </div>

      {/* 视频漂移墙：只在中部与右部，不可点击、不可拖动 */}
      <div className="video-canvas" aria-hidden="true">
        <ChromaZone className="video-chroma" radius={420} idleOpacity={0.92}>
          <div className="drift-wall">
            {COLUMNS.map((col, ci) => (
              <div
                className="drift-col"
                key={ci}
                style={{
                  "--dur": `${col.dur}s`,
                  "--dir": col.reverse ? "reverse" : "normal",
                }}
              >
                {[...col.tiles, ...col.tiles].map((file, i) => (
                  <div className="drift-tile" key={`${file}-${i}`}>
                    <video
                      poster={`/videos/${file}.jpg${file === "outro" ? "?v=3" : ""}`}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="auto"
                    >
                      <source
                        src={`/videos/${file}.webm${file === "outro" ? "?v=3" : ""}`}
                        type="video/webm"
                      />
                      <source
                        src={`/videos/${file}.mp4${file === "outro" ? "?v=3" : ""}`}
                        type="video/mp4"
                      />
                    </video>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ChromaZone>
      </div>

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

        <h1 className="hero-title hero-title--depth">
          <span className="depth-row" style={{ "--rd": "120ms" }}>
            <DepthText
              text="剪辑，是"
              layers={26}
              depth={2.6}
              tilt={9}
              smoothing={0.12}
              autoOrbit
              orbitSpeed={0.26}
              fontSize={TITLE_SIZE}
              fontWeight={900}
              faceColor="#eef1f4"
              depthColor="#ff5a36"
              shadow
            />
          </span>
          <span className="depth-row" style={{ "--rd": "260ms" }}>
            <DepthText
              text="一种"
              layers={26}
              depth={2.6}
              tilt={9}
              smoothing={0.12}
              autoOrbit
              orbitSpeed={0.26}
              fontSize={TITLE_SIZE}
              fontWeight={900}
              faceColor="#eef1f4"
              depthColor="#ff5a36"
              shadow
            />
            <DepthText
              text="叙事"
              layers={26}
              depth={2.6}
              tilt={9}
              smoothing={0.12}
              autoOrbit
              orbitSpeed={0.26}
              fontSize={TITLE_SIZE}
              fontWeight={900}
              faceColor="#ff5a36"
              depthColor="#7c1d0c"
              shadow
            />
            <DepthText
              text="。"
              layers={8}
              depth={2.6}
              tilt={9}
              smoothing={0.12}
              autoOrbit
              orbitSpeed={0.26}
              fontSize={TITLE_SIZE}
              fontWeight={900}
              faceColor="#eef1f4"
              depthColor="#ff5a36"
              shadow={false}
            />
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
