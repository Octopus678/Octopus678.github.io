import { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

const STATS = [
  { num: "1", sup: "+", label: "年新媒体实战经验" },
  { num: "5", sup: "", label: "平台矩阵内容运营" },
  { num: "2", sup: "", label: "段完整职业履历" },
  { num: "100", sup: "%", label: "脚本到成片全流程" },
];

const EXPERIENCES = [
  {
    company: "南京锋范文化传媒",
    role: "视频剪辑",
    date: "2026.04 — 2026.05",
    desc: "负责「锋哥大健康」IP 账号月度全量视频产出。参考对标账号进行文案拆解与二次创作，从脚本仿写、辅助拍摄到成片交付全流程独立完成，为旗下 IP 打造爆款短视频，支持多种风格快速产出。",
  },
  {
    company: "良欣国际",
    role: "多平台矩阵运营",
    date: "2025.07 — 2025.09",
    desc: "负责抖音、快手、小红书、视频号、美团等多平台账号矩阵运营，统筹内容发布与账号管理；对观看量、互动率、转化率等数据做系统化分析，为内容与运营策略提供数据支持。",
  },
];

const PHOTOS = Array.from({ length: 11 }, (_, i) => ({
  src: `/photos/p${i + 1}.jpg`,
  name: `现场 · 0${i + 1}`,
}));

const FOCUS_WORDS = ["节奏。", "叙事。", "留白。", "卡点。", "情绪。", "呼吸。", "克制。"];

export default function About() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [modal, setModal] = useState(false);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const itemH = () => trackRef.current?.parentElement.clientHeight || 600;
    const loop = (t) => {
      if (!lastRef.current) lastRef.current = t;
      const dt = t - lastRef.current;
      lastRef.current = t;
      if (!pausedRef.current) {
        // 每张照片约停留 6 秒，匀速滚动
        offsetRef.current += (dt * itemH()) / 6000;
        const cycle = itemH() * PHOTOS.length;
        if (offsetRef.current >= cycle) offsetRef.current -= cycle;
        if (trackRef.current) trackRef.current.style.transform = `translateY(${-offsetRef.current}px)`;
        const active = Math.floor(offsetRef.current / itemH()) % PHOTOS.length;
        setIndex((prev) => (prev === active ? prev : active));
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    const onResize = () => {
      if (trackRef.current) trackRef.current.style.transform = `translateY(${-offsetRef.current}px)`;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const openModal = (i) => {
    setIndex(i);
    setModal(true);
  };

  const jumpTo = (i) => {
    const h = trackRef.current?.parentElement.clientHeight || 600;
    offsetRef.current = i * h;
    setIndex(i);
  };

  return (
    <section id="about" className="section section--soft">
      <div className="container">
        <div className="section-head reveal">
          <span className="overline">01 / About — 关于我</span>
          <h2 className="section-title">
            剪辑之外，<em>也懂内容</em>与数据
          </h2>
          <p className="section-note">
            我的经历不是单一岗位：做过剪辑、也做过矩阵运营。这让我剪片子时，
            想的不只是画面，而是这条内容在平台上如何被看见。
          </p>
        </div>

        <div className="about-grid">
          <div className="portrait-wrap reveal" style={{ "--d": "80ms" }}>
            <div className="portrait">
              <img src={PHOTOS[0].src} alt="晋浩宇工作照" loading="lazy" />
              <span className="portrait-tag">EDITOR</span>
              <div className="portrait-caption">
                <span className="rec">
                  <i aria-hidden="true" />
                  ON SET
                </span>
                <span>JIN HAOYU</span>
              </div>
            </div>
            <i className="portrait-frame-corner tl" aria-hidden="true" />
            <i className="portrait-frame-corner tr" aria-hidden="true" />
            <i className="portrait-frame-corner bl" aria-hidden="true" />
            <i className="portrait-frame-corner br" aria-hidden="true" />
          </div>

          <div className="about-body">
            <div className="about-name reveal">
              <h3>晋浩宇</h3>
              <span className="en latin">JIN HAOYU</span>
            </div>
            <div className="about-role reveal">短视频剪辑 / 全流程内容创作者</div>
            <p className="about-desc reveal">
              1 年新媒体实战经验，先后经历<strong>视频剪辑</strong>与<strong>矩阵运营</strong>
              两种角色。擅长<em>对标拆解与二次创作</em>，曾负责「锋哥大健康」IP 月度全量视频产出，
              具备从脚本仿写、辅助拍摄到成片交付的<strong>全流程能力</strong>。
              坚持用数据复盘内容，用节奏讲好故事。
            </p>

            <div className="stats reveal">
              {STATS.map((s) => (
                <div className="stat" key={s.label}>
                  <div className="num latin">
                    {s.num}
                    {s.sup && <sup>{s.sup}</sup>}
                  </div>
                  <div className="label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="about-lower">
              <ul className="exp-list reveal">
                {EXPERIENCES.map((e) => (
                  <li className="exp-item" key={e.company}>
                    <div className="head">
                      <div>
                        <h4>{e.company}</h4>
                        <span className="role">{e.role}</span>
                      </div>
                      <span className="date latin">{e.date}</span>
                    </div>
                    <p>{e.desc}</p>
                  </li>
                ))}
              </ul>

              <div className="contact-card reveal" style={{ "--d": "120ms" }}>
                <h5 className="latin">Contact / 联系方式</h5>
                <div className="contact-row">
                  <span className="k">电话</span>
                  <a className="v latin" href="tel:+8613333443088">
                    133 3344 3088
                  </a>
                </div>
                <div className="contact-row">
                  <span className="k">邮箱</span>
                  <a className="v" href="mailto:pidtiy@163.com">
                    pidtiy@163.com
                  </a>
                </div>
                <div className="contact-row">
                  <span className="k">常驻</span>
                  <span className="v">南京 · 中国</span>
                </div>
                <div className="contact-edu">
                  <span>教育：山西工学院 · 本科</span>
                  <span className="right latin">2021 — 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="focus-gallery reveal">
          <div className="focus-words" aria-hidden="true">
            {[0, 1].map((dup) => (
              <span key={dup} style={{ display: "contents" }}>
                {FOCUS_WORDS.map((w) => (
                  <span key={`${dup}-${w}`}>{w}</span>
                ))}
              </span>
            ))}
          </div>

          <div className="focus-stage">
            <div
              className="phone"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="phone-frame">
                <div className="phone-screen">
                  <div className="photo-track" ref={trackRef}>
                    {[0, 1].map((dup) => (
                      <span key={dup} style={{ display: "contents" }}>
                        {PHOTOS.map((p, i) => (
                          <button
                            type="button"
                            key={`${dup}-${p.src}`}
                            className="photo-item"
                            onClick={() => openModal(i)}
                            aria-label={`查看照片 ${p.name}`}
                          >
                            <img src={p.src} alt={p.name} loading="lazy" />
                            <span className="photo-item-num latin">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          </button>
                        ))}
                      </span>
                    ))}
                  </div>
                  <span className="phone-time latin">09:41</span>
                  <span className="phone-dyn" aria-hidden="true" />
                </div>
              </div>
              <div className="phone-glow" aria-hidden="true" />
            </div>

            <div className="focus-caption">
              <span className="latin">
                SHOOT · {String(index + 1).padStart(2, "0")} / {PHOTOS.length}
              </span>
              <span>镜头内外，都是我日常</span>
            </div>

            <div className="focus-dots">
              {PHOTOS.map((p, i) => (
                <button
                  type="button"
                  key={p.src}
                  className={`focus-dot ${i === index ? "is-active" : ""}`}
                  onClick={() => jumpTo(i)}
                  aria-label={`切换到照片 ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)}>
        <div className="photo-modal">
          <img src={PHOTOS[index].src} alt={PHOTOS[index].name} />
          <div className="photo-modal-meta">
            <span className="latin">
              {String(index + 1).padStart(2, "0")} / {PHOTOS.length}
            </span>
            <span>{PHOTOS[index].name}</span>
          </div>
          <button
            type="button"
            className="photo-prev"
            aria-label="上一张"
            onClick={() => setIndex((index - 1 + PHOTOS.length) % PHOTOS.length)}
          >
            ‹
          </button>
          <button
            type="button"
            className="photo-next"
            aria-label="下一张"
            onClick={() => setIndex((index + 1) % PHOTOS.length)}
          >
            ›
          </button>
        </div>
      </Modal>
    </section>
  );
}
