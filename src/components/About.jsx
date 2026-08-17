import { lazy, Suspense, useState } from "react";
import Modal from "./Modal";
import CircularGallery from "./CircularGallery/CircularGallery";
import ProfileCard from "./ProfileCard/ProfileCard";

const Lanyard = lazy(() => import("./Lanyard/Lanyard"));

const PHOTOS = Array.from({ length: 11 }, (_, i) => ({
  src: `/photos/p${i + 1}.jpg`,
  name: `现场 · 0${i + 1}`,
}));

const INTRO_WORDS = ["节奏。", "叙事。", "留白。", "卡点。", "情绪。", "呼吸。", "克制。"];

export default function About() {
  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState(false);

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
              <div className="profile-card-wrap">
                <ProfileCard
                  avatarUrl={PHOTOS[0].src}
                  name="晋浩宇"
                  title="短视频剪辑 / 全流程内容创作者"
                  handle="jinhaoyu"
                  status="南京 · 随时可聊"
                  contactText="联系我"
                  behindGlowColor="rgba(255, 90, 54, 0.45)"
                  behindGlowSize="55%"
                  innerGradient="linear-gradient(145deg, #3a12108c 0%, #ff5a3644 100%)"
                  onContactClick={() =>
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              </div>
            </div>

            <div className="intro-lanyard">
              <div className="lanyard-box">
                <Suspense fallback={<div className="lanyard-fallback" />}>
                  <Lanyard
                    frontImage={PHOTOS[7].src}
                    backImage={PHOTOS[1].src}
                    imageFit="cover"
                  />
                </Suspense>
              </div>
              <p className="lanyard-hint">按住卡牌拖动 · 可以翻转</p>
            </div>
          </div>
        </div>

        <div className="gallery-section reveal">
          <div className="gallery-headline">
            <span className="overline">Gallery / 现场照片</span>
            <h3>镜头内外，都是我日常</h3>
            <p>按住拖动 / 滚轮 / 方向键浏览 · 点击照片查看大图</p>
          </div>
          <div className="circular-gallery-wrap">
            <CircularGallery
              items={PHOTOS.map((p) => ({
                image: p.src,
                text: "",
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
