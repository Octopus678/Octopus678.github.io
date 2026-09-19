import { useCallback, useMemo, useState } from "react";
import EvilEye from "../EvilEye/EvilEye";
import "./MagicCard.css";

const LINES = [
  "你可以叫我：章鱼鸽🐙",
  "我是绿老头",
  "合作：合作中遵循甲方意见但不全采纳，仅作贴合视频主题的修改",
  { label: "合作理念：", strong: "沟通无碍，尊重共见，成片至精" }
];

/**
 * 合作卡片：结构参考 Uiverse「JohnnyCSilva/quick-chicken-16」的卡片效果
 * （默认只有图案，悬停图案放大/模糊/浮动，卡片轻微放大旋转），
 * 图案换成 React Bits EvilEye；点击后图案退场，文字按 Originkit「Popcorn Text」
 * 的方式逐字弹入（随机顺序 + 随机旋转）。
 */
export default function MagicCard() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  /* 每次展开重新生成一份随机延迟/旋转，逐字弹入手感更自然 */
  const popLines = useMemo(() => {
    let order = 0;
    return LINES.map((line) => {
      const raw = typeof line === "string" ? line : line.label + line.strong;
      const chars = Array.from(raw).map((ch) => {
        const item = {
          ch,
          delay: +(order * 0.018 + Math.random() * 0.16).toFixed(3),
          rotate: +((Math.random() - 0.5) * 26).toFixed(1)
        };
        order += 1;
        return item;
      });
      return { chars, strongStart: typeof line === "string" ? -1 : Array.from(line.label).length };
    });
  }, [open]);

  const renderLine = (line, li) => (
    <p className={`magic-card__line line-${li + 1}`} key={li}>
      {line.chars.map((c, ci) => (
        <span
          key={`${li}-${ci}`}
          className={`pop${line.strongStart > -1 && ci >= line.strongStart ? " is-strong" : ""}`}
          style={{ "--d": `${c.delay}s`, "--r": `${c.rotate}deg` }}
        >
          {c.ch}
        </span>
      ))}
    </p>
  );

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
        {popLines.map((line, li) => renderLine(line, li))}
      </div>

      <span className="magic-card__hint" aria-hidden="true">
        {open ? "点击收起" : "点击展开"}
      </span>
    </div>
  );
}
