const WORKS = [
  {
    feature: true,
    index: "01",
    title: "「锋哥大健康」IP 月度全量视频",
    meta: ["HEALTH VERTICAL", "抖音", "2026.04"],
    desc: "以对标账号「炒粉」为参考，逐条拆解爆款文案结构并完成二次创作。负责账号当月全部视频产出：脚本仿写、辅助拍摄、剪辑调色到成片交付全流程独立完成，为 IP 打造出爆款短视频，并支持多种风格快速切换产出。",
    tags: ["对标拆解", "二次创作", "全流程交付", "IP 打造"],
    tint: { "--tint-a": "#1c1513", "--tint-b": "#0b0a0b", "--tint-glow": "rgba(255,90,54,0.22)", "--glow-x": "74%", "--glow-y": "26%" },
  },
  {
    index: "02",
    title: "多平台矩阵内容运营",
    meta: ["MATRIX OPERATION", "全平台", "2025"],
    desc: "统筹抖音、快手、小红书、视频号、美团五大平台的内容发布与账号管理，参与选题策划与后期运营执行，用观看量、互动率、转化率等直播数据系统化复盘，反哺内容策略。",
    tags: ["矩阵运营", "内容策划", "数据复盘"],
    tint: { "--tint-a": "#101720", "--tint-b": "#0a0c10", "--tint-glow": "rgba(94,190,255,0.18)", "--glow-x": "30%", "--glow-y": "40%" },
  },
  {
    index: "03",
    title: "直播全链路支持",
    meta: ["LIVE COMMERCE", "中控 / 场控 / 助播", "2025"],
    desc: "覆盖直播前后全链路：商品链接制作、上下架管理、品牌方对接；直播中协助主播互动、营造活跃氛围，提升用户停留与参与度；配合团队完成复盘与流程优化。",
    tags: ["直播操盘", "商品管理", "复盘优化"],
    tint: { "--tint-a": "#181510", "--tint-b": "#0b0a09", "--tint-glow": "rgba(255,196,84,0.18)", "--glow-x": "66%", "--glow-y": "62%" },
  },
];

function WorkCover({ work }) {
  return (
    <div className="work-cover">
      <div className="still" style={work.tint} aria-hidden="true" />
      <div className="work-tc latin">
        <i className="rec" aria-hidden="true" />
        <span>00:{String(work.index * 12).padStart(2, "0")}:04:18</span>
      </div>
      <span className="work-index latin">{work.index} / 03</span>
      <div className="work-wave" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
    </div>
  );
}

export default function Works() {
  return (
    <section id="works" className="section">
      <div className="container">
        <div className="section-head reveal">
          <span className="overline">02 / Selected Works — 精选作品</span>
          <h2 className="section-title">
            最近剪过的<em>内容</em>
          </h2>
          <p className="section-note">
            以下作品节选自我的实际工作产出。目前为视频占位画面，后续替换为真实作品截图与视频链接。
          </p>
        </div>

        <div className="works-grid">
          {WORKS.map((work, i) => (
            <article
              key={work.index}
              className={`work-card reveal ${work.feature ? "work-card--feature" : ""}`}
              style={{ "--d": `${i * 90}ms` }}
            >
              <WorkCover work={work} />
              <div className="work-body">
                <div className="work-meta latin">
                  {work.meta.map((m, j) => (
                    <span key={m}>
                      {j > 0 && <span className="sep" aria-hidden="true" />}
                      {m}
                    </span>
                  ))}
                </div>
                <h3 className="work-title">
                  {work.title}
                  <span className="more latin">CASE →</span>
                </h3>
                <p className="work-desc">{work.desc}</p>
                <div className="work-tags">
                  {work.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="works-foot reveal">
          <a href="#contact" className="btn-ghost">
            <span>想要完整作品集？联系我获取案例合集</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
