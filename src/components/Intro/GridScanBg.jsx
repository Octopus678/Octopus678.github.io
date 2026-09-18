import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GRIDSCAN_FRAG, GRIDSCAN_VERT } from "./gridscanShaders";
import "./GridScanBg.css";

/**
 * React Bits GridScan（背景）精简移植版：
 * 保留官方着色器与扫描/视差参数，去掉人脸追踪、摄像头预览与后期处理依赖。
 */

const MAX_SCANS = 8;

const srgbColor = (hex) => new THREE.Color(hex).convertSRGBToLinear();

function smoothDampVec2(current, target, currentVelocity, smoothTime, maxSpeed, deltaTime) {
  const out = current.clone();
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current.clone().sub(target);
  const originalTo = target.clone();

  const maxChange = maxSpeed * smoothTime;
  if (change.length() > maxChange) change.setLength(maxChange);

  target = current.clone().sub(change);
  const temp = currentVelocity.clone().addScaledVector(change, omega).multiplyScalar(deltaTime);
  currentVelocity.sub(temp.clone().multiplyScalar(omega));
  currentVelocity.multiplyScalar(exp);

  out.copy(target.clone().add(change.add(temp).multiplyScalar(exp)));

  const origMinusCurrent = originalTo.clone().sub(current);
  const outMinusOrig = out.clone().sub(originalTo);
  if (origMinusCurrent.dot(outMinusOrig) > 0) {
    out.copy(originalTo);
    currentVelocity.set(0, 0);
  }
  return out;
}

function smoothDampFloat(current, target, velRef, smoothTime, maxSpeed, deltaTime) {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current - target;
  const originalTo = target;

  const maxChange = maxSpeed * smoothTime;
  change = Math.sign(change) * Math.min(Math.abs(change), maxChange);

  target = current - change;
  const temp = (velRef.v + omega * change) * deltaTime;
  velRef.v = (velRef.v - omega * temp) * exp;

  let out = target + (change + temp) * exp;

  const origMinusCurrent = originalTo - current;
  const outMinusOrig = out - originalTo;
  if (origMinusCurrent * outMinusOrig > 0) {
    out = originalTo;
    velRef.v = 0;
  }
  return { value: out, v: velRef.v };
}

export default function GridScanBg({
  className = "",
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = "#2F293A",
  scanColor = "#FF9FFC",
  scanOpacity = 0.4,
  gridScale = 0.1,
  lineStyle = "solid",
  lineJitter = 0.1,
  scanDirection = "pingpong",
  noiseIntensity = 0.01,
  scanGlow = 0.5,
  scanSoftness = 2,
  scanPhaseTaper = 0.9,
  scanDuration = 2,
  scanDelay = 2,
  lightMode = false
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const uniforms = {
      iResolution: {
        value: new THREE.Vector3(container.clientWidth, container.clientHeight, renderer.getPixelRatio())
      },
      iTime: { value: 0 },
      uSkew: { value: new THREE.Vector2(0, 0) },
      uTilt: { value: 0 },
      uYaw: { value: 0 },
      uLineThickness: { value: lineThickness },
      uLinesColor: { value: srgbColor(linesColor) },
      uScanColor: { value: srgbColor(scanColor) },
      uGridScale: { value: gridScale },
      uLineStyle: { value: lineStyle === "dashed" ? 1 : lineStyle === "dotted" ? 2 : 0 },
      uLineJitter: { value: Math.max(0, Math.min(1, lineJitter || 0)) },
      uScanOpacity: { value: scanOpacity },
      uNoise: { value: noiseIntensity },
      uBloomOpacity: { value: 0 },
      uScanGlow: { value: scanGlow },
      uScanSoftness: { value: scanSoftness },
      uPhaseTaper: { value: scanPhaseTaper },
      uScanDuration: { value: Math.max(0.05, scanDuration) },
      uScanDelay: { value: Math.max(0, scanDelay) },
      uScanDirection: { value: scanDirection === "backward" ? 1 : scanDirection === "pingpong" ? 2 : 0 },
      uScanStarts: { value: new Array(MAX_SCANS).fill(0) },
      uScanCount: { value: 0 },
      uLightMode: { value: lightMode ? 1 : 0 }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: GRIDSCAN_VERT,
      fragmentShader: GRIDSCAN_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const startLerp = (a, b, t) => a + (b - a) * t;
    const smoothTime = startLerp(0.45, 0.12, sensitivity);
    const skewScale = startLerp(0.06, 0.2, sensitivity);
    const tiltScale = startLerp(0.12, 0.3, sensitivity);
    const yawScale = startLerp(0.1, 0.28, sensitivity);
    const yBoost = startLerp(1.2, 1.6, sensitivity);

    const lookTarget = new THREE.Vector2(0, 0);
    const lookCurrent = new THREE.Vector2(0, 0);
    const lookVel = new THREE.Vector2(0, 0);
    let tiltCurrent = 0;
    let tiltVel = 0;
    let yawCurrent = 0;
    let yawVel = 0;
    let leaveTimer = null;

    let scanStarts = [];
    let lastScanAt = -Infinity;
    const scanPeriod = Math.max(0.6, uniforms.uScanDuration.value + uniforms.uScanDelay.value);

    const pushScan = (t) => {
      const arr = scanStarts.slice();
      if (arr.length >= MAX_SCANS) arr.shift();
      arr.push(t);
      scanStarts = arr;
      const buf = new Array(MAX_SCANS).fill(0);
      for (let i = 0; i < arr.length && i < MAX_SCANS; i += 1) buf[i] = arr[i];
      uniforms.uScanStarts.value = buf;
      uniforms.uScanCount.value = arr.length;
    };
    pushScan(0.2);

    const onMove = (event) => {
      if (leaveTimer) {
        clearTimeout(leaveTimer);
        leaveTimer = null;
      }
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      lookTarget.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
    };
    const onLeave = () => {
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => lookTarget.set(0, 0), 250);
    };
    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      uniforms.iResolution.value.set(
        container.clientWidth,
        container.clientHeight,
        renderer.getPixelRatio()
      );
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    let raf = 0;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      const time = now / 1000;

      lookCurrent.copy(
        smoothDampVec2(lookCurrent, lookTarget, lookVel, smoothTime, Infinity, dt)
      );
      const tiltSm = smoothDampFloat(tiltCurrent, 0, { v: tiltVel }, smoothTime, Infinity, dt);
      tiltCurrent = tiltSm.value;
      tiltVel = tiltSm.v;
      const yawSm = smoothDampFloat(yawCurrent, 0, { v: yawVel }, smoothTime, Infinity, dt);
      yawCurrent = yawSm.value;
      yawVel = yawSm.v;

      uniforms.uSkew.value.set(
        lookCurrent.x * skewScale,
        -lookCurrent.y * yBoost * skewScale
      );
      uniforms.uTilt.value = tiltCurrent * tiltScale;
      uniforms.uYaw.value = THREE.MathUtils.clamp(yawCurrent * yawScale, -0.6, 0.6);
      uniforms.iTime.value = time;

      if (time - lastScanAt > scanPeriod) {
        lastScanAt = time;
        pushScan(time);
      }

      renderer.clear(true, true, true);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (leaveTimer) clearTimeout(leaveTimer);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      material.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    sensitivity,
    lineThickness,
    linesColor,
    scanColor,
    scanOpacity,
    gridScale,
    lineStyle,
    lineJitter,
    scanDirection,
    noiseIntensity,
    scanGlow,
    scanSoftness,
    scanPhaseTaper,
    scanDuration,
    scanDelay,
    lightMode
  ]);

  return <div ref={containerRef} className={`gridscan ${className}`.trim()} aria-hidden="true" />;
}
