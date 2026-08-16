import { useEffect, useRef, useState } from "react";

const MARQUEE_WORDS = [
  "抖音",
  "快手",
  "小红书",
  "视频号",
  "美团",
  "对标拆解",
  "二次创作",
  "全流程交付",
  "直播操盘",
  "数据复盘",
];

export default function Hero() {
  const canvasRef = useRef(null);
  const [videoOk, setVideoOk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    let particles = [];
    let mouse = { x: -9999, y: -9999 };

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(0.05 + Math.random() * 0.28),
        a: 0.12 + Math.random() * 0.4,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const onMouse = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      const linkDist = 130;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.008;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        // gentle mouse repulsion
        const dxm = p.x - mouse.x;
        const dym = p.y - mouse.y;
        const dm2 = dxm * dxm + dym * dym;
        if (dm2 < 180 * 180 && dm2 > 0.01) {
          const d = Math.sqrt(dm2);
          const force = (180 - d) / 180;
          p.x += (dxm / d) * force * 0.6;
          p.y += (dym / d) * force * 0.6;
        }

        const alpha = p.a * (0.65 + 0.35 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 228, 236, ${alpha})`;
        ctx.fill();
      }

      // sparse links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / linkDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255, 90, 54, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // drifting scan band
      const bandY = (t * 0.012) % (h + 240) - 120;
      const grad = ctx.createLinearGradient(0, bandY - 60, 0, bandY + 60);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.028)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, bandY - 60, w, 120);

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("mouseout", onLeave);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  useEffect(() => {
    // A real clip placed at public/hero.mp4 will play as the background automatically.
    const v = document.createElement("video");
    v.preload = "metadata";
    v.src = "/hero.mp4";
    v.oncanplay = () => setVideoOk(true);
    v.onerror = () => setVideoOk(false);
  }, []);

  return (
    <section id="top" className="hero">
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
      {videoOk && (
        <video className="hero-video" autoPlay muted loop playsInline src="/hero.mp4" aria-hidden="true" />
      )}

      <div className="container hero-inner">
        <div className="hero-kicker reveal in">
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
          OUTPUT — <b>1080P · 60FPS · 16:9 / 9:16</b>
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
