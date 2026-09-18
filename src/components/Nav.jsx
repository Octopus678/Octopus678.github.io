import { useEffect, useState } from "react";
import PillNav from "./PillNav/PillNav";

// 首个条目同时作为 logo 的跳转目标（React Bits PillNav 的约定）
const ITEMS = [
  { href: "#top", label: "首页" },
  { href: "#about", label: "关于" },
  { href: "#works", label: "作品" },
  { href: "#strengths", label: "优势" },
  { href: "#contact", label: "联系" },
];

export default function Nav() {
  const [active, setActive] = useState("#top");

  useEffect(() => {
    const ids = ITEMS.map((l) => l.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="nav-shell">
      <PillNav
        logo="/logo.svg"
        logoAlt="晋浩宇 · 短视频剪辑"
        items={ITEMS}
        activeHref={active}
        baseColor="#0f1013"
        pillColor="rgba(255, 255, 255, 0.07)"
        pillTextColor="#eef1f4"
        hoveredPillTextColor="#0a0b0d"
        initialLoadAnimation
      />
    </div>
  );
}
