import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./PillNav.css";

/**
 * 复用 React Bits PillNav 的悬停动效（底部圆形填充 + 文字上翻），
 * 用于站内其他按钮：外观、位置、内容全部由外部 class/children 决定。
 */
export default function PillButton({
  href,
  className = "",
  children,
  ariaLabel,
  vars,
  ease = "power3.easeOut"
}) {
  const circleRef = useRef(null);
  const tlRef = useRef(null);
  const activeTweenRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      const circle = circleRef.current;
      if (!circle?.parentElement) return;

      const pill = circle.parentElement;
      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      if (!w || !h) return;

      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`
      });

      const label = pill.querySelector(".pill-label");
      const hover = pill.querySelector(".pill-label-hover");

      if (label) gsap.set(label, { y: 0 });
      if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
      if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
      if (hover) {
        gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(hover, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
      }

      tlRef.current = tl;
    };

    layout();
    window.addEventListener("resize", layout);
    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => {
      window.removeEventListener("resize", layout);
      tlRef.current?.kill();
      activeTweenRef.current?.kill();
    };
  }, [ease]);

  const handleEnter = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto"
    });
  };

  const handleLeave = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto"
    });
  };

  return (
    <a
      href={href}
      className={`pill ${className}`.trim()}
      aria-label={ariaLabel}
      style={vars}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span
        className="hover-circle"
        aria-hidden="true"
        ref={el => {
          circleRef.current = el;
        }}
      />
      <span className="label-stack">
        <span className="pill-label">{children}</span>
        <span className="pill-label-hover" aria-hidden="true">
          {children}
        </span>
      </span>
    </a>
  );
}
