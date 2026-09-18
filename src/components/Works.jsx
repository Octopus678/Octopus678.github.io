import ChromaZone from "./ChromaZone/ChromaZone";
import MorphSlider from "./MorphSlider/MorphSlider";

const REELS = [
  { file: "reel-worldnews", caption: "国际时政" },
  { file: "reel-sep2", caption: "9 月 2 日 · 作品" },
  { file: "reel-interview", caption: "访谈 · 人物纪实" },
  { file: "reel-finance2", caption: "财经解读 2" },
  { file: "reel-outro", caption: "结束宣传片" },
  { file: "reel-fengdu", caption: "丰都鬼城 · 文旅短片" },
  { file: "reel-politics", caption: "时政解读" },
  { file: "reel-liveclip", caption: "直播切片" },
  { file: "reel-qixue", caption: "气血离居" },
  { file: "reel-tcm1", caption: "中医科普 1" },
  { file: "reel-tcm2", caption: "中医科普 2" },
  { file: "reel-flyco", caption: "飞科产品细节" },
  { file: "reel-finance1", caption: "财经解读 1" },
  { file: "reel-finance3", caption: "财经解读 3" },
];

export default function Works() {
  return (
    <section id="works" className="section works">
      <div className="container">
        <div className="section-head reveal">
          <span className="overline">02 / Selected Works — 高光作品集</span>
          <h2 className="section-title">
            高光<em>作品集</em>
          </h2>
          <p className="section-note">
            14 支成片以形变（morph）方式轮播。拖动或点箭头切换，
            <strong>点击画面即可原地播放</strong>（带声音），再点一次暂停。
          </p>
        </div>
      </div>

      <div className="morph-stage reveal">
        <div className="container morph-stage-inner">
          <ChromaZone className="morph-chroma" radius={340} idleOpacity={0.9}>
            <MorphSlider
              items={REELS.map((r) => ({
                image: `/videos/${r.file}.mp4`,
                webm: `/videos/${r.file}.webm`,
                poster: `/videos/${r.file}.jpg`,
                caption: r.caption,
                type: "video",
              }))}
              transition="melt"
              duration={1.1}
              intensity={1.05}
              scale={2.6}
              aberration={0.4}
              drift={0.5}
              autoplay
              autoplayDelay={7}
              loop
              radius={16}
              showCaptions
              showControls
              showIndicators
              overlayColor="#08080a"
            />
          </ChromaZone>
        </div>
        <p className="morph-hint">点击画面原地播放 / 暂停 · 拖动切换 · ← → 方向键换片</p>
      </div>
    </section>
  );
}
