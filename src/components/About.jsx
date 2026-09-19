import ProfileCard from "./ProfileCard/ProfileCard";
import MagicCard from "./MagicCard/MagicCard";

const PORTRAIT = "/photos/p1.jpg";

const INTRO_WORDS = ["节奏。", "叙事。", "留白。", "卡点。", "情绪。", "呼吸。", "克制。"];

export default function About() {
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
                  avatarUrl={PORTRAIT}
                  name="晋浩宇"
                  title="短视频剪辑 / 全流程内容创作者"
                  handle="jinhaoyu"
                  status="南京 · 随时可聊"
                  contactText="联系我"
                  showUserInfo={true}
                  enableTilt={true}
                  enableMobileTilt={false}
                  onContactClick={() =>
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              </div>
            </div>

            <div className="intro-magic">
              <MagicCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
