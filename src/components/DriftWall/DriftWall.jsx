import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./DriftWall.css";

/**
 * DriftWall（参考 React Bits DriftWall 官方源码改造）
 * 差异：磁贴渲染的是 <video>（静音循环自动播放），布局为横向漂移的 4 行，磁贴严格 1:1。
 * 交互：3D 倾斜平面跟随鼠标视差、逐行速度/方向不同、悬停磁贴抬升并还原原色、其余磁贴轻微压暗。
 */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 每行速度系数：黄金分割伪随机，保证每行速度都不一样（官方同名逻辑） */
const rowFactor = (index, variance) => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

export default function DriftWall({
  items = [],
  rows = 4,
  columns = 4,
  gap = 16,
  radius = 12,
  tilt = 9,
  turn = -15,
  roll = 0,
  perspective = 1500,
  depth = 80,
  speed = 24,
  variance = 0.5,
  parallax = 0.6,
  lift = 70,
  dim = 0.9,
  overlayColor = "#07060c",
  overlayOpacity = 0.12,
  grayscale = false,
  maxTile = 320,
  className = "",
  style,
}) {
  const rootRef = useRef(null);
  const planeRef = useRef(null);
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const dampedRef = useRef({ x: 0, y: 0 });
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [reduced, setReduced] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeRow, setActiveRow] = useState(-1);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event) => setReduced(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width || 0;
      const h = entry.contentRect.height || 0;
      setBox((prev) => (Math.abs(prev.w - w) < 1 && Math.abs(prev.h - h) < 1 ? prev : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* 磁贴尺寸：由容器高度反推，4 行刚好铺满首屏，且宽高严格相等（1:1） */
  const tileSize = useMemo(() => {
    const h = box.h || 720;
    const fit = (h - (rows - 1) * gap) / rows;
    return Math.max(110, Math.min(fit * 0.98, maxTile));
  }, [box.h, rows, gap, maxTile]);

  /* 每行磁贴：按顺序切片，不足的行循环补齐，保证每行宽度一致（无缝循环） */
  const rowItems = useMemo(() => {
    if (!items.length) return [];
    const total = rows * columns;
    const flat = Array.from({ length: total }, (_, i) => items[i % items.length]);
    return Array.from({ length: rows }, (_, r) => flat.slice(r * columns, (r + 1) * columns));
  }, [items, rows, columns]);

  const applyPlane = useCallback(
    (px, py) => {
      const plane = planeRef.current;
      if (!plane) return;
      plane.style.transform =
        `translate(-50%, -50%) rotateX(${tilt + py}deg) rotateY(${turn + px}deg) ` +
        `rotateZ(${roll}deg) translateZ(${-depth}px)`;
    },
    [tilt, turn, roll, depth]
  );

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    let last = null;
    const tick = (ts) => {
      const dt = last === null ? 0.016 : Math.min(0.05, Math.max(0, ts - last) / 1000);
      last = ts;
      const maxTilt = parallax * 8;
      const tx = targetRef.current.x * maxTilt;
      const ty = -targetRef.current.y * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.12);
      dampedRef.current.x += (tx - dampedRef.current.x) * damp;
      dampedRef.current.y += (ty - dampedRef.current.y) * damp;
      applyPlane(dampedRef.current.x, dampedRef.current.y);
      if (Math.abs(tx - dampedRef.current.x) < 0.002 && Math.abs(ty - dampedRef.current.y) < 0.002) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [applyPlane, parallax]);

  useEffect(() => {
    if (reduced || parallax <= 0) {
      applyPlane(0, 0);
      return undefined;
    }
    const onMove = (event) => {
      targetRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
      startLoop();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [applyPlane, parallax, reduced, startLoop]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    },
    []
  );

  const cssVars = {
    "--dw-tile": `${tileSize}px`,
    "--dw-gap": `${gap}px`,
    "--dw-radius": `${radius}px`,
    "--dw-perspective": `${perspective}px`,
    "--dw-lift": `${lift}px`,
    "--dw-dim": dim,
    "--dw-gray": grayscale ? 1 : 0,
    "--dw-overlay": overlayColor,
    "--dw-overlay-o": overlayOpacity,
    width: `${columns * (tileSize + gap)}px`,
    ...style,
  };

  /* 悬停态用状态类驱动（官方 DriftWall 做法）：磁贴在 3D 图层里用 :hover 会有失效情况 */
  const handlePointerMove = useCallback((event) => {
    const tile = event.target.closest?.("[data-tile-id]");
    const id = tile ? tile.dataset.tileId : null;
    if (id === undefined) return;
    setActiveId((prev) => (prev === id ? prev : id));
    setActiveRow((prev) => {
      const next = tile ? Number(tile.dataset.row) : -1;
      return prev === next ? prev : next;
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setActiveId(null);
    setActiveRow(-1);
  }, []);

  return (
    <div
      ref={rootRef}
      className={["drift-wall", reduced ? "drift-wall--reduced" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={cssVars}
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div ref={planeRef} className="drift-wall__plane">
        {rowItems.map((row, r) => (
          <div
            className={`drift-wall__row${activeRow === r ? " is-paused" : ""}`}
            key={`row-${r}`}
          >
            <div
              className="drift-wall__track"
              style={{
                animationDuration: `${(
                  (columns * (tileSize + gap)) /
                  Math.max(1, speed * rowFactor(r, variance))
                ).toFixed(2)}s`,
                animationDirection: r % 2 === 0 ? "normal" : "reverse",
              }}
            >
              {[...row, ...row].map((item, i) => (
                <div
                  className={`drift-wall__tile${
                    activeId === `${r}-${i}` ? " is-active" : ""
                  }`}
                  key={`${r}-${i}-${item.id}`}
                  data-tile-id={`${r}-${i}`}
                  data-row={r}
                >
                  <span className="drift-wall__inner">
                    <video
                      poster={item.poster}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="auto"
                      disablePictureInPicture
                    >
                      {item.webm ? <source src={item.webm} type="video/webm" /> : null}
                      {item.mp4 ? <source src={item.mp4} type="video/mp4" /> : null}
                    </video>
                    <span className="drift-wall__overlay" aria-hidden="true" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
