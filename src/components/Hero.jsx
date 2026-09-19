import { useEffect, useState } from "react";
import MoltenMetal from "./MoltenMetal/MoltenMetal";
import DriftWall from "./DriftWall/DriftWall";
import DepthText from "./DepthText/DepthText";
import GooeyNav from "./GooeyNav/GooeyNav";
import BorderGlow from "./BorderGlow/BorderGlow";

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

// 头部视频墙（React Bits DriftWall 形式）：14 支成片，1:1 方形磁贴，4 行横向漂移
const HEAD_VIDEO_FILES = [
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
  "finance3",
];

const cacheBust = (file) => (file === "outro" ? "?v=3" : "");

const WALL_VIDEOS = HEAD_VIDEO_FILES.map((file) => ({
  id: file,
  poster: `/videos/${file}.jpg${cacheBust(file)}`,
  webm: `/videos/${file}.webm${cacheBust(file)}`,
  mp4: `/videos/${file}.mp4${cacheBust(file)}`,
}));

const TITLE_SIZE = "clamp(2.4rem, 6.2vw, 6.9rem)";

export default function Hero() {
  const [scrolled, setScrolled] = useState(false);

  /* 两个 CTA：GooeyNav 提供果冻粒子与文字切换，BorderGlow 负责每颗按钮的边缘发光 */
  const ctaItems = [
    {
      href: "#contact",
      label: "聊聊合作",
      content: (
        <BorderGlow
          className="hero-cta hero-cta--primary"
          backgroundColor="transparent"
          borderRadius={999}
          glowRadius={30}
          glowIntensity={1.15}
          coneSpread={32}
          edgeSensitivity={34}
          fillOpacity={0.4}
          colors={["#ff5a36", "#ff9a5c", "#ff3d16"]}
        >
          <span>聊聊合作</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </BorderGlow>
      )
    },
    {
      href: "#works",
      label: "查看作品",
      content: (
        <BorderGlow
          className="hero-cta hero-cta--ghost"
          backgroundColor="transparent"
          borderRadius={999}
          glowRadius={30}
          glowIntensity={1}
          coneSpread={32}
          edgeSensitivity={34}
          fillOpacity={0.32}
          colors={["#ff5a36", "#ffb27a", "#ff5a36"]}
        >
          <span>查看作品</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </BorderGlow>
      )
    }
  ];

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

      {/* 视频漂移墙：React Bits DriftWall 形式，4 行 1:1 方形视频，不可点击打开 */}
      <div className="video-canvas" aria-hidden="true">
        <DriftWall
          items={WALL_VIDEOS}
          rows={4}
          columns={4}
          gap={16}
          radius={12}
          tilt={9}
          turn={-15}
          perspective={1500}
          depth={80}
          speed={24}
          variance={0.5}
          parallax={0.6}
          lift={70}
          dim={0.9}
          overlayColor="#07060c"
          overlayOpacity={0.12}
          maxTile={320}
        />
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

        {/* CTA：GooeyNav 果冻效果 + BorderGlow 边缘发光，点击跳到对应栏目 */}
        <div className="hero-actions">
          <GooeyNav
            items={ctaItems}
            particleCount={14}
            particleDistances={[80, 10]}
            particleR={90}
            timeVariance={280}
            initialActiveIndex={0}
          />
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
