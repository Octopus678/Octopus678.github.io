import { useEffect, useRef, useState } from "react";
import MoltenMetal from "./MoltenMetal/MoltenMetal";
import LightRays from "./LightRays/LightRays";
import FallingText from "./FallingText/FallingText";
import PillButton from "./PillNav/PillButton";
import WarpText from "./WarpText/WarpText";

// 尾页落体关键词（React Bits FallingText）：每个词组出现两次，顺序打乱后随机掉落
const FALLING_WORDS_BASE = [
  "组成部分",
  "设计",
  "反应",
  "关于",
  "剪辑",
  "审美",
  "成片",
  "发展",
  "快速",
  "精致",
];
/* 洗牌并避免同一个词紧挨着出现，掉落更随机 */
const shuffleWords = (list) => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] === arr[i - 1]) {
      const k = arr.findIndex((v, idx) => idx > i && v !== arr[i - 1]);
      if (k > -1) {
        [arr[i], arr[k]] = [arr[k], arr[i]];
      }
    }
  }
  return arr;
};

const FALLING_WORDS = shuffleWords([...FALLING_WORDS_BASE, ...FALLING_WORDS_BASE]).join(" ");

/* 固定引用，避免每次渲染都把词重建、打乱已经落定的位置 */
const FALLING_HIGHLIGHTS = ["剪辑", "审美", "成片"];

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
        {/* 标题区毛玻璃底（与顶部导航同一套玻璃质感） */}
        <div className="closing-glass">
          <h2 className="closing-title reveal">
            有片子，<em>随时聊</em>
          </h2>

          <div className="closing-warp reveal">
            <WarpText
              text="沟通让疑难有解，尊重让见解有光，成片让精致可见"
              color="#f8f5ff"
              fontSize="clamp(2.2rem, 4vw, 4.2rem)"
              fontWeight={600}
              letterSpacing="0.02em"
              lineHeight={1.25}
            />
          </div>
        </div>

        {/* 关键词落体：与标题同栏、位于标题层下方，仅作视觉，不可点击 */}
        <div className="closing-falling">
          <FallingText
            text={FALLING_WORDS}
            highlightWords={FALLING_HIGHLIGHTS}
            highlightClass="ft-accent"
            trigger="scroll"
            gravity={0.9}
            fontSize="clamp(2.2rem, 4vw, 4.2rem)"
            lineHeight={1.2}
            interactive={false}
            settleAfter={6500}
          />
        </div>

        <p className="closing-sub reveal">
          无论是月度内容合作、单条视频代剪，还是成片交付，都可以先聊聊需求。
        </p>

        <div className="closing-actions reveal">
          <PillButton
            href="tel:+8613333443088"
            className="btn-primary"
            ariaLabel="拨打电话或加微信 133 3344 3088（微信同号）"
            vars={{
              "--base": "#0a0b0d",
              "--pill-bg": "var(--accent)",
              "--pill-text": "#0a0b0d",
              "--hover-text": "#f6f7f8"
            }}
          >
            <span className="icon" aria-hidden="true">
              ☎
            </span>
            <span className="latin">133 3344 3088</span>
            <span className="tag">微信同号</span>
          </PillButton>
          <PillButton
            href="mailto:pidtiy@163.com"
            className="btn-ghost"
            ariaLabel="发送邮件 pidtiy@163.com"
            vars={{
              "--base": "var(--accent)",
              "--pill-bg": "transparent",
              "--pill-text": "var(--muted)",
              "--hover-text": "#0a0b0d"
            }}
          >
            <span>pidtiy@163.com</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </PillButton>
        </div>

        <div className="closing-chips reveal">
          <span className="chip">抖音 @悲惨章鱼鸽</span>
          <span className="chip">小红书 内容账号</span>
          <span className="chip">视频号 个人号</span>
          <span className="chip">南京 · 可线下面聊</span>
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
