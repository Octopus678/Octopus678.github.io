import MoltenMetal from "./MoltenMetal/MoltenMetal";

export default function Closing() {
  return (
    <section id="contact" className="closing">
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
      <div className="container closing-main">
        <span className="overline" style={{ justifyContent: "center" }}>
          04 / Contact — 联系我
        </span>
        <h2 className="closing-title reveal">
          有片子，<em>随时聊</em>
        </h2>
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
