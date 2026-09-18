// 取自 React Bits ChromaGrid（MIT）的 chroma 光斑效果，抽成可复用容器：
// https://www.reactbits.dev/components/chroma-grid
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./ChromaZone.css";

export default function ChromaZone({
  children,
  className = "",
  radius = 320,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
  idleOpacity = 1,
  style,
}) {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px");
    setY.current = gsap.quickSetter(el, "--y", "px");
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current?.(pos.current.x);
    setY.current?.(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e) => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: idleOpacity, duration: fadeOut, overwrite: true });
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-zone ${className}`.trim()}
      style={{ "--r": `${radius}px`, ...style }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" style={{ opacity: idleOpacity }} />
    </div>
  );
}
