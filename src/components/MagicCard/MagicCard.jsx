import { useCallback, useState } from "react";
import EvilEye from "../EvilEye/EvilEye";
import "./MagicCard.css";

/**
 * 合作卡片：结构参考 Uiverse「JohnnyCSilva/quick-chicken-16」的卡片效果
 * （默认只有图案，悬停图案放大/模糊/浮动，卡片轻微放大旋转），
 * 图案换成 React Bits EvilEye，点击后图案退场、文字逐行浮现。
 */
export default function MagicCard() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <div className={`magic-card${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="magic-card__hit"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "收起合作说明" : "展开合作说明"}
      />

      <div className="magic-card__eye" aria-hidden="true">
        <EvilEye
          eyeColor="#ff5a36"
          intensity={1.2}
          pupilSize={0.6}
          irisWidth={0.25}
          glowIntensity={0.32}
          scale={0.92}
          noiseScale={1}
          pupilFollow={1}
          flameSpeed={0.9}
          backgroundColor="#140d0a"
        />
      </div>

      <div className="magic-card__body">
        <p className="magic-card__line" style={{ "--i": 0 }}>
          你可以叫我：章鱼鸽🐙
        </p>
        <p className="magic-card__line" style={{ "--i": 1 }}>
          我是绿老头
        </p>
        <p className="magic-card__line" style={{ "--i": 2 }}>
          合作：合作中遵循甲方意见但不全采纳，仅作贴合视频主题的修改
        </p>
        <p className="magic-card__line" style={{ "--i": 3 }}>
          合作理念：<strong>沟通无碍，尊重共见，成片至精</strong>
        </p>
      </div>

      <span className="magic-card__hint" aria-hidden="true">
        {open ? "点击收起" : "点击展开"}
      </span>
    </div>
  );
}
