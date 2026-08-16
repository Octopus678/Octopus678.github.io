import { useEffect, useState } from "react";

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
          OUTPUT — <b>1080P · 60FPS · 9:16 / 16:9</b>
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
