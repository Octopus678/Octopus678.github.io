import { useEffect, useRef, useState } from "react";
import MoltenMetal from "./MoltenMetal/MoltenMetal";
import LightRays from "./LightRays/LightRays";
import MaskedHeading from "./MaskedHeading/MaskedHeading";
import FallingText from "./FallingText/FallingText";

// 尾页落体关键词（React Bits FallingText）
const FALLING_WORDS = "组成部分 设计 反应 关于 剪辑 审美 成片 发展 快速 精致";

export default function Closing() {
  const sectionRef = useRef(null);
  const [raysOn, setRaysOn] = useState(false);

  /* 滑到最后一栏：光束打开；划出这一栏：光束消失 */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        setRaysOn(entry.isIntersecting && entry.intersectionRatio >= 0.15);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="contact" className="closing" ref={sectionRef}>
      <div className="closing-bg" aria-hidden="true">
        <img src="/bg.jpg" alt="" />
      </div>
      <div className="closing-molten" aria-hidden="true">
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
      <div className="closing-shade" aria-hidden="true" />

      {/* 灯光光束：仅在本栏可见时点亮 */}
      <div className={`closing-rays ${raysOn ? "is-on" : ""}`} aria-hidden="true">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffc9a0"
          raysSpeed={0.9}
          lightSpread={1.2}
          rayLength={2.2}
          fadeDistance={1.1}
          saturation={0.95}
          pulsating={false}
          followMouse
          mouseInfluence={0.16}
          noiseAmount={0.04}
          distortion={0.1}
        />
      </div>

      <div className="container closing-main">
        <span className="overline" style={{ justifyContent: "center" }}>
          04 / Contact — 联系我
        </span>
        <MaskedHeading
          className="closing-heading"
          text="有片子 随时聊"
          tag="h2"
          mediaType="video"
          src="/videos/outro.mp4?v=3"
          fillScale={1.35}
          parallax={22}
          drift={14}
          brightness={1.05}
          saturation={1.05}
          reveal="rise"
          duration={1.25}
          stagger={0.12}
          trigger="view"
          align="center"
          weight={800}
          tracking={0.02}
          lineHeight={1.06}
          textScale={0.095}
        />
        <p className="closing-sub reveal">
          无论是月度内容合作、单条视频代剪，还是成片交付，都可以先聊聊需求。
        </p>

        <div className="closing-actions reveal">
          <a href="tel:+8613333443088" className="btn-primary">
            <span aria-hidden="true">☎</span>
            <span className="latin">133 3344 3088</span>
          </a>
          <a href="mailto:pidtiy@163.com" className="btn-ghost">
            <span>pidtiy@163.com</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <div className="closing-chips reveal">
          <span className="chip">抖音 @晋浩宇</span>
          <span className="chip">小红书 内容账号</span>
          <span className="chip">视频号 个人号</span>
          <span className="chip">南京 · 可线下面聊</span>
        </div>

        {/* 关键词落体：滑到本栏后自由下落，可鼠标拖动 */}
        <div className="closing-falling">
          <FallingText
            text={FALLING_WORDS}
            highlightWords={["剪辑", "审美", "成片"]}
            highlightClass="ft-accent"
            trigger="scroll"
            gravity={0.9}
            mouseConstraintStiffness={0.25}
            fontSize="1.05rem"
          />
        </div>
      </div>

      <footer className="closing-footer">
        <div className="container row">
          <span className="copy latin">
            © 2026 <b>JIN HAOYU</b> — 短视频剪辑手 · 全流程内容创作者
          </span>
          <a href="#top" className="back">
            <span aria-hidden="true">↑</span>
            BACK TO TOP
          </a>
        </div>
      </footer>
    </section>
  );
}
