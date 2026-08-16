import { lazy, Suspense, useMemo, useState } from "react";
import Modal from "./Modal";
import CircularGallery from "./CircularGallery/CircularGallery";

const Lanyard = lazy(() => import("./Lanyard/Lanyard"));

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

const INTRO_WORDS = ["节奏。", "叙事。", "留白。", "卡点。", "情绪。", "呼吸。", "克制。"];

function makeIntroCard() {
  const W = 720;
  const H = 1012;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 底色：深色 + 红色辉光
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#191720");
  bg.addColorStop(1, "#0b0a0e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.7, H * 0.18, 10, W * 0.7, H * 0.18, 420);
  glow.addColorStop(0, "rgba(255,90,54,0.35)");
  glow.addColorStop(1, "rgba(255,90,54,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 顶部条
  ctx.fillStyle = "#ff5a36";
  ctx.fillRect(0, 0, W, 10);

  const sans = '"Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 英文名
  ctx.fillStyle = "rgba(245,243,239,0.55)";
  ctx.font = `500 30px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText("JIN HAOYU", W / 2, 130);

  // 名字
  ctx.fillStyle = "#f5f3ef";
  ctx.font = `700 104px ${sans}`;
  ctx.fillText("晋浩宇", W / 2, 260);

  // 角色
  ctx.fillStyle = "#ff5a36";
  ctx.font = `600 34px ${sans}`;
  ctx.fillText("短视频剪辑 · 全流程内容创作者", W / 2, 368);

  // 分隔线
  ctx.strokeStyle = "rgba(255,90,54,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, 470);
  ctx.lineTo(W / 2 + 120, 470);
  ctx.stroke();

  // 简介
  ctx.fillStyle = "rgba(245,243,239,0.78)";
  ctx.font = `400 30px ${sans}`;
  ctx.fillText("1 年新媒体实战经验", W / 2, 560);
  ctx.fillText("抖音 / 快手 / 小红书 / 视频号 / 美团", W / 2, 630);
  ctx.fillText("从脚本拆解到成片交付 · 全流程", W / 2, 700);

  // 联系
  ctx.fillStyle = "#f5f3ef";
  ctx.font = `600 34px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText("133 3344 3088", W / 2, 850);
  ctx.fillStyle = "rgba(245,243,239,0.75)";
  ctx.font = `400 30px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText("pidtiy@163.com", W / 2, 910);

  // 底栏
  ctx.fillStyle = "rgba(245,243,239,0.4)";
  ctx.font = `400 22px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillText("EDITOR · NANJING", W / 2, 966);

  return canvas.toDataURL("image/png");
}

export default function About() {
  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState(false);
  const introCard = useMemo(() => makeIntroCard(), []);

  const openModal = (i) => {
    setIndex(i);
    setModal(true);
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

        <div className="intro-panel reveal">
          <div className="intro-words" aria-hidden="true">
            {[0, 1].map((dup) => (
              <span key={dup} style={{ display: "contents" }}>
                {INTRO_WORDS.map((w) => (
                  <span key={`${dup}-${w}`}>{w}</span>
                ))}
              </span>
            ))}
          </div>

          <div className="intro-grid">
            <div className="intro-photo">
              <div className="intro-device">
                <img src={PHOTOS[0].src} alt="晋浩宇现场照片" loading="lazy" />
                <span className="intro-device-tag">EDITOR · JIN HAOYU</span>
              </div>
            </div>

            <div className="intro-lanyard">
              <div className="lanyard-box">
                <Suspense fallback={<div className="lanyard-loading latin">LOADING CARD…</div>}>
                  <Lanyard frontImage={introCard} backImage={PHOTOS[1].src} imageFit="cover" />
                </Suspense>
              </div>
              <p className="lanyard-hint">按住卡牌拖动 · 可以翻转 · 这是我的名片</p>
            </div>
          </div>
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

        <div className="gallery-section reveal">
          <div className="gallery-headline">
            <span className="overline">Shoot / 现场照片</span>
            <h3>镜头内外，都是我日常</h3>
            <p>按住拖动 / 滚轮 / 方向键浏览 · 点击照片查看大图</p>
          </div>
          <div className="circular-gallery-wrap">
            <CircularGallery
              items={PHOTOS.map((p, i) => ({
                image: p.src,
                text: `SHOOT ${String(i + 1).padStart(2, "0")}`,
              }))}
              bend={2.5}
              textColor="#d98a5a"
              borderRadius={0.06}
              font="bold 26px 'Microsoft YaHei', 'PingFang SC', sans-serif"
              scrollSpeed={1.8}
              scrollEase={0.05}
              onItemClick={openModal}
            />
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
