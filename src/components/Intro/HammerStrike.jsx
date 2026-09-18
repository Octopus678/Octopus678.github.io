import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * 锤击动画（参考 Originkit「Hammer Strike」的行为描述自行实现）：
 * 手柄从右端为轴完成 52° 行程 → 命中铁砧的同一帧铁砧从底边压扁 → 回弹 8° 再回落一次。
 * 加载过程中循环，加载完成后停在落锤后的静止姿。
 */

const DEG = Math.PI / 180;
const REST = 26 * DEG; // 命中角度
const RAISED = -26 * DEG; // 抬起角度（52° 行程）
const BOUNCE = 18 * DEG; // 回弹 8°
const PIVOT = { x: 1.6, y: 0.89 };
const REACH = 1.72;
const ANVIL_Y = -1.05;
const SPARKS = 46;

const easeOut = (t) => 1 - (1 - t) ** 3;
const easeIn = (t) => t ** 3;
const lerp = (a, b, t) => a + (b - a) * t;

function Anvil({ impactRef }) {
  const group = useRef(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const dt = impactRef.current.dt;
    const t = impactRef.current.time - impactRef.current.at;
    const wob = t >= 0 && t < 1.2 ? Math.exp(-7 * t) * Math.cos(18 * t) : 0;
    const sq = wob * 0.1;
    g.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
    void dt;
  });

  return (
    <group ref={group} position={[0, ANVIL_Y, 0]}>
      {/* 底座 */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.78, 0.16, 0.82]} />
        <meshStandardMaterial color="#454b57" metalness={0.45} roughness={0.48} />
      </mesh>
      {/* 第二级台阶 */}
      <mesh position={[0, 0.23, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.18, 0.16, 0.64]} />
        <meshStandardMaterial color="#4d5462" metalness={0.45} roughness={0.45} />
      </mesh>
      {/* 腰身（四棱锥台） */}
      <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.44, 4]} />
        <meshStandardMaterial color="#535b6b" metalness={0.45} roughness={0.42} />
      </mesh>
      {/* 顶部砧面 */}
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.26, 0.7]} />
        <meshStandardMaterial color="#5b6371" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* 前伸的角（horn） */}
      <mesh position={[0.98, 0.82, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.22, 0.62, 24]} />
        <meshStandardMaterial color="#5b6371" metalness={0.5} roughness={0.36} />
      </mesh>
      {/* 砧面上的高光条 */}
      <mesh position={[0, 0.955, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.44, 0.62]} />
        <meshStandardMaterial color="#7d8798" metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Hammer({ activeRef, progressRef, impactRef, onSettled }) {
  const group = useRef(null);
  const flashes = useRef(null);
  const points = useRef(null);
  const state = useRef({ t: 0, struck: false, settled: false });
  const impact = impactRef;

  const sparkData = useMemo(() => {
    const positions = new Float32Array(SPARKS * 3).fill(-999);
    const velocities = new Float32Array(SPARKS * 3);
    const life = new Float32Array(SPARKS);
    return { positions, velocities, life };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(sparkData.positions, 3));
    return g;
  }, [sparkData]);

  const spawnSparks = () => {
    const head = new THREE.Vector3(PIVOT.x - REACH * Math.cos(REST), PIVOT.y - REACH * Math.sin(REST), 0);
    for (let i = 0; i < SPARKS; i += 1) {
      const a = Math.random() * Math.PI - Math.PI / 2;
      const speed = 0.9 + Math.random() * 2.4;
      sparkData.life[i] = 0.32 + Math.random() * 0.42;
      sparkData.positions[i * 3] = head.x + (Math.random() - 0.5) * 0.2;
      sparkData.positions[i * 3 + 1] = head.y - 0.18 + Math.random() * 0.1;
      sparkData.positions[i * 3 + 2] = (Math.random() - 0.5) * 0.18;
      sparkData.velocities[i * 3] = Math.cos(a) * speed * (Math.random() > 0.5 ? 1 : -1) * 0.9;
      sparkData.velocities[i * 3 + 1] = Math.abs(Math.sin(a)) * speed + 0.8;
      sparkData.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
  };

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    impact.current.dt = dt;
    impact.current.time += dt;
    const g = group.current;
    if (!g) return;

    const active = activeRef.current;
    const progress = progressRef.current;
    const s = state.current;

    const period = lerp(1.72, 1.0, Math.min(1, Math.max(0, progress)));

    if (active || !s.settled) {
      s.t += dt;
      if (s.t > period) {
        s.t = 0;
        s.struck = false;
      }
    }

    const p = Math.min(1, s.t / period);
    let angle;
    if (p < 0.42) {
      angle = lerp(REST, RAISED, easeOut(p / 0.42));
    } else if (p < 0.58) {
      angle = lerp(RAISED, REST, easeIn((p - 0.42) / 0.16));
    } else if (p < 0.72) {
      angle = lerp(REST, BOUNCE, easeOut((p - 0.58) / 0.14));
    } else if (p < 0.86) {
      angle = lerp(BOUNCE, REST, easeOut((p - 0.72) / 0.14));
    } else {
      angle = REST;
    }
    g.rotation.z = angle;

    // 命中帧：铁砧压扁 + 火花 + 闪光
    if (p >= 0.58 && !s.struck) {
      s.struck = true;
      impact.current.at = impact.current.time;
      spawnSparks();
      if (flashes.current) flashes.current.intensity = 14;
    }

    // 相机/整体轻微震动
    const since = impact.current.time - impact.current.at;
    const shake = since >= 0 && since < 0.3 ? Math.exp(-14 * since) : 0;
    g.parent.position.y = Math.sin(impact.current.time * 70) * 0.014 * shake;
    g.parent.position.x = Math.cos(impact.current.time * 62) * 0.012 * shake;

    // 火花粒子
    for (let i = 0; i < SPARKS; i += 1) {
      if (sparkData.life[i] <= 0) continue;
      sparkData.life[i] -= dt;
      if (sparkData.life[i] <= 0) {
        sparkData.positions[i * 3 + 1] = -999;
        continue;
      }
      sparkData.velocities[i * 3 + 1] -= 5.2 * dt;
      sparkData.positions[i * 3] += sparkData.velocities[i * 3] * dt;
      sparkData.positions[i * 3 + 1] += sparkData.velocities[i * 3 + 1] * dt;
      sparkData.positions[i * 3 + 2] += sparkData.velocities[i * 3 + 2] * dt;
    }
    geometry.attributes.position.needsUpdate = true;

    if (flashes.current && flashes.current.intensity > 0) {
      flashes.current.intensity = Math.max(0, flashes.current.intensity - dt * 60);
    }
    if (points.current) {
      points.current.material.opacity = 0.95;
    }

    if (!active && p > 0.99 && !s.settled) {
      s.settled = true;
      onSettled?.();
    }
  });

  return (
    <>
      <group ref={group} position={[PIVOT.x, PIVOT.y, 0]} rotation={[0, 0, REST]}>
        {/* 手柄 */}
        <mesh position={[-REACH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.062, 0.08, REACH * 0.98, 20]} />
          <meshStandardMaterial color="#3b2b22" metalness={0.15} roughness={0.72} />
        </mesh>
        {/* 握把尾端 */}
        <mesh position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.18, 20]} />
          <meshStandardMaterial color="#241a15" metalness={0.2} roughness={0.8} />
        </mesh>
        {/* 锤头 */}
        <mesh position={[-REACH, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.68, 30]} />
          <meshStandardMaterial color="#e6ebf3" metalness={0.55} roughness={0.24} />
        </mesh>
        {/* 锤头两端倒角环 */}
        {[-0.3, 0.3].map((z) => (
          <mesh key={z} position={[-REACH, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.238, 0.028, 12, 30]} />
            <meshStandardMaterial color="#aab3c1" metalness={0.6} roughness={0.2} />
          </mesh>
        ))}
        {/* 锤头与手柄的连接套 */}
        <mesh position={[-REACH + 0.36, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 20]} />
          <meshStandardMaterial color="#98a1af" metalness={0.6} roughness={0.24} />
        </mesh>
      </group>

      <points ref={points} geometry={geometry}>
        <pointsMaterial
          color="#ffb27a"
          size={0.055}
          sizeAttenuation
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <pointLight ref={flashes} position={[0.05, 0.05, 0.5]} color="#ff8a4c" intensity={0} distance={6} />
    </>
  );
}

export default function HammerStrike({ active = true, progress = 0, onSettled }) {
  const activeRef = useRef(active);
  const progressRef = useRef(progress);
  activeRef.current = active;
  progressRef.current = progress;

  const impactRef = useRef({ time: 0, at: -99, dt: 0.016 });

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [1.5, 1.0, 5.5], fov: 30 }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0.2, 0);
      }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={0.75} />
      <hemisphereLight args={["#ffd9c2", "#0b0d12", 0.75]} />
      <directionalLight position={[3.6, 5.2, 4.2]} intensity={3} color="#ffffff" />
      <directionalLight position={[-4.2, 2.4, 2.2]} intensity={2.1} color="#ff7a45" />
      <directionalLight position={[0.5, -2.5, 3]} intensity={0.9} color="#6f8dff" />
      <group>
        <Anvil impactRef={impactRef} />
        <Hammer
          activeRef={activeRef}
          progressRef={progressRef}
          impactRef={impactRef}
          onSettled={onSettled}
        />
      </group>
    </Canvas>
  );
}
