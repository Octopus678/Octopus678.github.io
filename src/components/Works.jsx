import { useState } from "react";
import Modal from "./Modal";

const VIDEOS = [
  { name: "景总1", file: "jingzong1", tag: "人物 · 纪实" },
  { name: "平哥2", file: "pingge2", tag: "口播 · 短视频" },
  { name: "慧子", file: "huizi", tag: "竖屏 · 短视频" },
  { name: "李云雅1", file: "liyunya1", tag: "竖屏 · 短视频" },
];

export default function Works() {
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [active, setActive] = useState(null);
  const spinning = !userPaused && !hoverPaused;

  return (
    <section id="works" className="section works">
      <div className="container">
        <div className="section-head reveal">
          <span className="overline">02 / Selected Works — 精选作品</span>
          <h2 className="section-title">
            最近剪过的<em>成片</em>
          </h2>
          <p className="section-note">
            四支 9:16 竖屏成片组成旋转视频柱，在黑暗中持续转动。悬停暂停，点击画面在站内打开观看。
          </p>
        </div>
      </div>

      <div className="prism-stage reveal">
        <div className="prism-glow" aria-hidden="true" />
        <div className={`prism ${spinning ? "" : "prism--paused"}`}>
          {VIDEOS.map((v, i) => (
            <button
              type="button"
              key={v.file}
              className="prism-face"
              style={{
                transform: `rotateY(${i * 90}deg) translateZ(200px)`,
              }}
              onClick={() => setActive(v)}
              onMouseEnter={() => setHoverPaused(true)}
              onMouseLeave={() => setHoverPaused(false)}
              aria-label={`播放作品 ${v.name}`}
            >
              <video
                src={`/videos/${v.file}.mp4`}
                poster={`/videos/${v.file}.jpg`}
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
              />
              <span className="prism-face-tag latin">9:16 REEL</span>
              <span className="prism-face-name">
                {v.name}
                <small>{v.tag}</small>
              </span>
              <span className="prism-face-play" aria-hidden="true">
                ▶
              </span>
            </button>
          ))}
        </div>

        <div className="prism-controls">
          <button
            type="button"
            className={`prism-btn ${spinning ? "is-on" : ""}`}
            onClick={() => setUserPaused((p) => !p)}
          >
            <span className="prism-btn-icon" aria-hidden="true">
              {spinning ? "❚❚" : "▶"}
            </span>
            {spinning ? "暂停旋转" : "继续旋转"}
          </button>
          <span className="prism-hint">悬停画面可暂停 · 点击画面打开视频</span>
        </div>
      </div>

      <Modal open={active !== null} onClose={() => setActive(null)} wide>
        {active && (
          <div className="video-modal">
            <video
              key={active.file}
              src={`/videos/${active.file}.mp4`}
              poster={`/videos/${active.file}.jpg`}
              controls
              autoPlay
              playsInline
            />
            <div className="video-modal-meta">
              <span>{active.name}</span>
              <span className="latin">{active.tag} · 9:16</span>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
