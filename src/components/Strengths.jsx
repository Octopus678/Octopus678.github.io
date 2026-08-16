const ICONS = {
  script: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M8 8h8M8 12h5M8 16h8" />
    </svg>
  ),
  flow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h10M14 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M4 18h10M14 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M14 6h4M18 6v12M14 18h4" />
    </svg>
  ),
  matrix: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V10M10 21V4M15 21v-7M20 21V7" />
    </svg>
  ),
  rhythm: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  ),
  speed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  ),
};

const STRENGTHS = [
  {
    icon: "script",
    title: "文案拆解与二次创作",
    desc: "以对标账号为样本，逐条拆解爆款文案的钩子、结构与节奏，快速完成本地化改写与二次创作，让原创效率翻倍。",
  },
  {
    icon: "flow",
    title: "全流程创作交付",
    desc: "从脚本仿写、辅助拍摄、剪辑调色到成片交付，一条视频一个人走完全程，保证每个环节的意图一致。",
  },
  {
    icon: "matrix",
    title: "多平台矩阵思维",
    desc: "熟悉抖音、快手、小红书、视频号、美团的内容生态与分发逻辑，知道同样的素材在不同平台该怎么剪。",
  },
  {
    icon: "data",
    title: "数据驱动复盘",
    desc: "习惯用观看量、互动率、转化率说话，系统化复盘数据，反推内容结构与运营策略的下一步。",
  },
  {
    icon: "rhythm",
    title: "审美与叙事节奏",
    desc: "懂画面、懂卡点、懂留白：音乐、字幕、转场与情绪节奏统一调配，让每条视频都有自己的呼吸感。",
  },
  {
    icon: "speed",
    title: "高频快速产出",
    desc: "月度全量内容交付的实战节奏，多种风格快速切换，抗压、细心、负责，能在截稿线前稳定输出。",
  },
];

export default function Strengths() {
  return (
    <section id="strengths" className="section section--soft">
      <div className="container">
        <div className="section-head reveal">
          <span className="overline">03 / Strengths — 个人优势</span>
          <h2 className="section-title">
            我能为你<em>搞定</em>什么
          </h2>
          <p className="section-note">
            六项核心能力，来自真实项目里的反复验证，而不是简历上的形容词。
          </p>
        </div>

        <div className="strength-grid">
          {STRENGTHS.map((s, i) => (
            <article
              className="strength-card reveal"
              key={s.title}
              style={{ "--d": `${(i % 3) * 90}ms` }}
            >
              <div className="strength-top">
                <span className="strength-num latin">0{i + 1}</span>
                <span className="strength-icon">{ICONS[s.icon]}</span>
              </div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
