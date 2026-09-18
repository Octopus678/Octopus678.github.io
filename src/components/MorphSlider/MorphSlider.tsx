import { useEffect, useRef, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Renderer, Triangle, Program, Mesh, Texture } from 'ogl';
import { gsap } from 'gsap';

import './MorphSlider.css';

export type MorphTransition = 'melt' | 'ripple' | 'shear' | 'swirl';

export interface MorphItem {
  image: string;
  caption?: string;
  /** 'video' 时按视频纹理加载并支持点击原地播放 */
  type?: 'image' | 'video';
  /** 可选：WebM 兜底源（浏览器不支持 mp4 时使用） */
  webm?: string;
  /** 可选：首帧封面（视频加载前先显示，避免空白） */
  poster?: string;
}

export interface MorphSliderProps {
  items?: MorphItem[];
  startIndex?: number;
  transition?: MorphTransition;
  duration?: number;
  ease?: string;
  intensity?: number;
  scale?: number;
  aberration?: number;
  drift?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  radius?: number;
  overlayColor?: string;
  showCaptions?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  className?: string;
  [key: string]: unknown;
}

interface EngineOptions {
  transition: MorphTransition;
  duration: number;
  ease: string;
  intensity: number;
  scale: number;
  aberration: number;
  drift: number;
  overlayColor: string;
  loop: boolean;
}

type GL = Renderer['gl'];

const TRANSITIONS: Record<MorphTransition, number> = { melt: 0, ripple: 1, shear: 2, swirl: 3 };

const DEFAULT_ITEMS: MorphItem[] = [
  {
    image: 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=1600&auto=format&fit=crop',
    caption: 'One'
  },
  {
    image: 'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=1600&auto=format&fit=crop',
    caption: 'Two'
  },
  {
    image: 'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=1600&auto=format&fit=crop',
    caption: 'Three'
  },
  {
    image: 'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=1600&auto=format&fit=crop',
    caption: 'Four'
  }
];

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform vec2 uResolution;
uniform vec2 uCurrentSize;
uniform vec2 uNextSize;
uniform float uProgress;
uniform float uDir;
uniform int uMode;
uniform float uIntensity;
uniform float uScale;
uniform float uAberration;
uniform float uDrift;
uniform float uTime;
uniform float uReduce;
uniform vec2 uPointer;
uniform vec3 uOverlay;

varying vec2 vUv;

const float PI = 3.14159265359;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

/* 按原始比例适配（contain）：竖屏保持竖屏、横屏保持横屏，多余区域留黑 */
vec2 coverUV(vec2 uv, vec2 res, vec2 img) {
  float rA = res.x / max(res.y, 1.0);
  float iA = img.x / max(img.y, 1.0);
  vec2 s = vec2(1.0);
  float ratio = rA / max(iA, 0.0001);
  if (ratio > 1.0) {
    s.x = ratio;
  } else {
    s.y = 1.0 / ratio;
  }
  return (uv - 0.5) * s + 0.5;
}

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  float env = sin(p * PI);

  vec2 uv = vUv;

  uv += vec2(sin(uTime * 0.25 + uv.y * 4.0), cos(uTime * 0.22 + uv.x * 4.0)) * uDrift * 0.008;
  uv = (uv - 0.5) * (1.0 - uDrift * 0.02 * sin(uTime * 0.4)) + 0.5;

  vec2 uvC = uv;
  vec2 uvN = uv;
  float m = smoothstep(0.0, 1.0, p);

  if (uReduce < 0.5) {
    if (uMode == 3) {
      vec2 c = uv - 0.5;
      float r = length(c);
      float ang = env * uIntensity * 3.5 * (1.0 - r);
      uvC = rot(ang) * c + 0.5;
      uvN = rot(-ang) * c + 0.5;
      m = smoothstep(0.0, 1.0, p);
    } else if (uMode == 1) {
      float d = distance(uv, uPointer);
      float ring = p * 1.6;
      float wave = sin((d - ring) * 30.0) * env;
      vec2 dir = normalize(uv - uPointer + 1e-4);
      vec2 disp = dir * wave * uIntensity * 0.25;
      uvC = uv + disp;
      uvN = uv + disp * 0.6;
      m = 1.0 - smoothstep(ring - 0.03, ring + 0.03, d);
    } else if (uMode == 2) {
      float slices = 14.0;
      float row = floor(uv.y * slices);
      float rnd = hash11(row);
      vec2 disp = vec2((rnd - 0.5) * env * uIntensity * 0.6, 0.0);
      uvC = uv + disp;
      uvN = uv + disp;
      float localX = uDir > 0.0 ? uv.x : 1.0 - uv.x;
      float th = p * 1.5 - 0.25 + (rnd - 0.5) * 0.25;
      m = 1.0 - smoothstep(th - 0.06, th + 0.06, localX);
    } else {
      float nn = fbm(uv * uScale + uTime * 0.03);
      float warp = fbm(uv * uScale * 1.7 - uTime * 0.02);
      vec2 g = vec2(nn, warp) - 0.5;
      uvC = uv + g * uIntensity * 0.5 * p;
      uvN = uv - g * uIntensity * 0.5 * (1.0 - p);
      m = smoothstep(nn - 0.15, nn + 0.15, p);
    }
  }

  vec2 sC = coverUV(uvC, uResolution, uCurrentSize);
  vec2 sN = coverUV(uvN, uResolution, uNextSize);

  float ca = uReduce < 0.5 ? uAberration * env * 0.03 : 0.0;

  vec3 colC = vec3(
    texture2D(tCurrent, sC + vec2(ca, 0.0)).r,
    texture2D(tCurrent, sC).g,
    texture2D(tCurrent, sC - vec2(ca, 0.0)).b
  );
  vec3 colN = vec3(
    texture2D(tNext, sN + vec2(ca, 0.0)).r,
    texture2D(tNext, sN).g,
    texture2D(tNext, sN - vec2(ca, 0.0)).b
  );

  // 画面之外的区域用底色填充（保持原始比例，不拉伸）
  if (sC.x < 0.0 || sC.x > 1.0 || sC.y < 0.0 || sC.y > 1.0) colC = uOverlay;
  if (sN.x < 0.0 || sN.x > 1.0 || sN.y < 0.0 || sN.y > 1.0) colN = uOverlay;

  vec3 col = mix(colC, colN, m);

  float vig = smoothstep(1.25, 0.25, length(uv - 0.5));
  col = mix(col, uOverlay, (1.0 - vig) * 0.28);

  gl_FragColor = vec4(col, 1.0);
}
`;

function makeFallbackTexture(gl: GL): Texture {
  const size = 4;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = 24;
    data[i * 4 + 1] = 24;
    data[i * 4 + 2] = 28;
    data[i * 4 + 3] = 255;
  }
  return new Texture(gl, { image: data, width: size, height: size, generateMipmaps: false });
}

function hexToRgb(hex: string): [number, number, number] {
  let h = (hex || '#000000').replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  }
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

interface EngineConfig {
  items: MorphItem[];
  startIndex: number;
  reducedMotion: boolean;
  getOptions: () => EngineOptions;
  onIndexChange: (index: number) => void;
  onAspectChange?: (ratio: number) => void;
  dprCap: number;
}

class MorphEngine {
  private container: HTMLElement;
  private items: MorphItem[];
  private getOptions: () => EngineOptions;
  private onIndexChange: (index: number) => void;
  private onAspectChange?: (ratio: number) => void;
  private reducedMotion: boolean;

  private current: number;
  private animating = false;
  private dragging = false;
  private dragDir = 0;
  private shownIndex: number;
  private tween: gsap.core.Tween | null = null;

  private renderer: Renderer;
  private gl: GL;
  private canvas: HTMLCanvasElement;
  private geometry: Triangle;
  private program: Program;
  private mesh: Mesh;
  private textures: Texture[];
  private sizes: [number, number][];
  private videos: (HTMLVideoElement | null)[] = [];
  private pendingFrame: boolean[] = [];
  private loadTimers: number[] = [];
  private loading: boolean[] = [];
  private loaded: boolean[] = [];
  private resizeObserver: ResizeObserver;
  private raf = 0;
  private boundLoop: (t: number) => void;
  private boundContextLost: (e: Event) => void;

  constructor(container: HTMLElement, config: EngineConfig) {
    this.container = container;
    this.items = config.items;
    this.getOptions = config.getOptions;
    this.onIndexChange = config.onIndexChange;
    this.onAspectChange = config.onAspectChange;
    this.reducedMotion = config.reducedMotion;
    this.current = config.startIndex;
    this.shownIndex = config.startIndex;

    this.renderer = new Renderer({
      alpha: false,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, config.dprCap)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0.05, 0.05, 0.06, 1);

    this.canvas = this.gl.canvas as HTMLCanvasElement;
    this.canvas.className = 'morph-slider-canvas';
    container.appendChild(this.canvas);

    this.geometry = new Triangle(this.gl);

    this.textures = this.items.map(() => makeFallbackTexture(this.gl));
    this.sizes = this.items.map(() => [1, 1] as [number, number]);

    const opts = this.getOptions();
    this.program = new Program(this.gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        tCurrent: { value: this.textures[this.current] },
        tNext: { value: this.textures[this.current] },
        uResolution: { value: [1, 1] },
        uCurrentSize: { value: this.sizes[this.current] },
        uNextSize: { value: this.sizes[this.current] },
        uProgress: { value: 0 },
        uDir: { value: 1 },
        uMode: { value: TRANSITIONS[opts.transition] ?? 0 },
        uIntensity: { value: opts.intensity },
        uScale: { value: opts.scale },
        uAberration: { value: opts.aberration },
        uDrift: { value: opts.drift },
        uTime: { value: 0 },
        uReduce: { value: this.reducedMotion ? 1 : 0 },
        uPointer: { value: [0.5, 0.5] },
        uOverlay: { value: hexToRgb(opts.overlayColor) }
      }
    });

    this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program });

    this.boundContextLost = this.onContextLost.bind(this);
    this.canvas.addEventListener('webglcontextlost', this.boundContextLost, false);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    this.loadTextures();

    this.boundLoop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.boundLoop);
  }

  private loadTextures(): void {
    // 按需加载：仅当前帧与左右相邻，滑动到新的一帧时再加载其相邻帧
    this.ensureAround(this.current);
  }

  private ensureAround(index: number): void {
    if (!this.items.length) return;
    const targets = [this.wrap(index), this.wrap(index + 1), this.wrap(index - 1)];
    targets.forEach(i => {
      if (this.loaded[i] || this.loading[i]) return;
      this.loading[i] = true;
      this.loadItem(this.items[i], i);
    });
  }

  private loadItem(item: MorphItem, index: number): void {
    {
      const isVideo = item.type === 'video' || /\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(item.image);
      if (isVideo) {
        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = false;
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';
        video.setAttribute('muted', '');
        // 优先 webm（体积小、兼容性好），mp4 兜底；挂到容器（隐藏）以确保可靠加载
        if (item.webm) {
          const webm = document.createElement('source');
          webm.src = item.webm;
          webm.type = 'video/webm';
          video.appendChild(webm);
        }
        const mp4 = document.createElement('source');
        mp4.src = item.image;
        mp4.type = 'video/mp4';
        video.appendChild(mp4);
        video.style.cssText =
          'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;left:-10px;top:-10px;';
        this.container.appendChild(video);
        this.videos[index] = video;
        // 先用封面图占位，视频就绪后再替换为视频纹理
        if (item.poster) {
          const poster = new Image();
          poster.crossOrigin = 'anonymous';
          poster.src = item.poster;
          poster.onload = () => {
            if (this.loaded[index]) return; // 视频已就绪则不再覆盖
            const texture = new Texture(this.gl, { generateMipmaps: false });
            texture.image = poster;
            this.textures[index] = texture;
            this.sizes[index] = [poster.naturalWidth || 720, poster.naturalHeight || 1280];
            this.loaded[index] = true;
            this.pendingFrame[index] = true;
            if (index === this.current) {
              this.program.uniforms.tCurrent.value = texture;
              this.program.uniforms.uCurrentSize.value = this.sizes[index];
              this.notifyAspect(index);
            }
          };
        }
        const onReady = () => {
          const texture = new Texture(this.gl, { generateMipmaps: false });
          texture.image = video;
          this.textures[index] = texture;
          this.sizes[index] = [video.videoWidth || 16, video.videoHeight || 9];
          this.loaded[index] = true;
          this.pendingFrame[index] = true;
          if (index === this.current) {
            this.program.uniforms.tCurrent.value = texture;
            this.program.uniforms.uCurrentSize.value = this.sizes[index];
            this.notifyAspect(index);
          }
          // 强制解码首帧，静止时也能显示画面
          try {
            video.pause();
            video.currentTime = 0.05;
          } catch {}
        };
        video.addEventListener('loadeddata', onReady, { once: true });
        video.addEventListener('seeked', () => {
          this.pendingFrame[index] = true;
        });
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.image;
      img.onload = () => {
        const texture = new Texture(this.gl, { generateMipmaps: false });
        texture.image = img;
        this.textures[index] = texture;
        this.sizes[index] = [img.naturalWidth || 1, img.naturalHeight || 1];
        this.loaded[index] = true;
        if (index === this.current) {
          this.program.uniforms.tCurrent.value = texture;
          this.program.uniforms.uCurrentSize.value = this.sizes[index];
        }
      };
      img.onerror = () => {};
    }
  }

  /** 点击画面：原地播放/暂停当前视频（不放大、不跳转） */
  togglePlay(): boolean {
    const video = this.videos[this.current];
    if (!video) return false;
    if (video.paused) {
      video.muted = false;
      video.loop = true;
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
    this.pendingFrame[this.current] = true;
    return true;
  }

  isCurrentVideoPlaying(): boolean {
    const video = this.videos[this.current];
    return !!video && !video.paused;
  }

  getCurrentVideo(): HTMLVideoElement | null {
    return this.videos[this.current] ?? null;
  }

  /** 当前视频播放进度 0-1 */
  getProgress(): number {
    const video = this.videos[this.current];
    if (!video || !isFinite(video.duration) || video.duration <= 0) return 0;
    return Math.min(1, Math.max(0, video.currentTime / video.duration));
  }

  /** 跳转到指定进度（拖动进度条） */
  seek(ratio: number): void {
    const video = this.videos[this.current];
    if (!video || !isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = Math.min(1, Math.max(0, ratio)) * video.duration;
    this.pendingFrame[this.current] = true;
  }

  seekStart(): void {
    const video = this.videos[this.current];
    if (video) video.dataset.wasPlaying = video.paused ? '' : '1';
    if (video && !video.paused) video.pause();
  }

  seekEnd(): void {
    const video = this.videos[this.current];
    if (video && video.dataset.wasPlaying === '1') {
      video.muted = false;
      void video.play().catch(() => {});
    }
  }

  private notifyAspect(index: number): void {
    const size = this.sizes[index];
    if (!size || !this.onAspectChange) return;
    const [w, h] = size;
    if (!w || !h) return;
    this.onAspectChange(w / h);
  }

  private pauseOthers(): void {
    this.videos.forEach((video, i) => {
      if (video && i !== this.current && !video.paused) video.pause();
    });
  }

  private resize(): void {
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    this.renderer.setSize(w, h);
    this.program.uniforms.uResolution.value = [this.gl.canvas.width, this.gl.canvas.height];
  }

  private syncOptions(): void {
    const opts = this.getOptions();
    this.program.uniforms.uMode.value = TRANSITIONS[opts.transition] ?? 0;
    this.program.uniforms.uIntensity.value = opts.intensity;
    this.program.uniforms.uScale.value = opts.scale;
    this.program.uniforms.uAberration.value = opts.aberration;
    this.program.uniforms.uDrift.value = opts.drift;
    this.program.uniforms.uOverlay.value = hexToRgb(opts.overlayColor);
  }

  private loop(t: number): void {
    this.program.uniforms.uTime.value = t * 0.001;
    if (!this.dragging && !this.animating) this.syncOptions();
    this.videos.forEach((video, i) => {
      const texture = this.textures[i];
      if (!video || !texture) return;
      if (!video.paused || this.pendingFrame[i]) {
        texture.needsUpdate = true;
        this.pendingFrame[i] = false;
      }
    });
    this.renderer.render({ scene: this.mesh });
    this.raf = requestAnimationFrame(this.boundLoop);
  }

  private wrap(i: number): number {
    const n = this.items.length;
    return ((i % n) + n) % n;
  }

  private prepareNext(dir: number): number {
    const target = this.wrap(this.current + dir);
    this.program.uniforms.tCurrent.value = this.textures[this.current];
    this.program.uniforms.uCurrentSize.value = this.sizes[this.current];
    this.program.uniforms.tNext.value = this.textures[target];
    this.program.uniforms.uNextSize.value = this.sizes[target];
    this.program.uniforms.uDir.value = dir;
    return target;
  }

  goTo(dir: number): void {
    if (this.animating || this.dragging || this.items.length < 2) return;
    const opts = this.getOptions();
    if (!opts.loop) {
      const raw = this.current + dir;
      if (raw < 0 || raw > this.items.length - 1) return;
    }
    const nextIndex = this.wrap(this.current + dir);
    if (!this.loaded[nextIndex]) this.ensureAround(nextIndex); // 立即开始加载该帧
    this.syncOptions();
    const target = this.prepareNext(dir);
    this.animating = true;
    this.announce(target);
    const duration = this.reducedMotion ? Math.min(opts.duration, 0.4) : opts.duration;
    this.tween = gsap.fromTo(
      this.program.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration,
        ease: opts.ease,
        onComplete: () => this.commit(target)
      }
    );
  }

  private announce(index: number): void {
    if (index === this.shownIndex) return;
    this.shownIndex = index;
    this.onIndexChange(index);
  }

  private commit(target: number): void {
    this.current = target;
    this.ensureAround(target);
    this.notifyAspect(target);
    this.pauseOthers();
    this.program.uniforms.tCurrent.value = this.textures[target];
    this.program.uniforms.uCurrentSize.value = this.sizes[target];
    this.program.uniforms.uProgress.value = 0;
    this.animating = false;
    this.tween = null;
    this.announce(target);
  }

  next(): void {
    this.goTo(1);
  }

  prev(): void {
    this.goTo(-1);
  }

  setPointer(x: number, y: number): void {
    this.program.uniforms.uPointer.value = [x, y];
  }

  beginDrag(): boolean {
    if (this.animating || this.items.length < 2) return false;
    this.dragging = true;
    this.dragDir = 0;
    this.syncOptions();
    return true;
  }

  drag(ndx: number): void {
    if (!this.dragging) return;
    const opts = this.getOptions();
    const dir = ndx < 0 ? 1 : -1;
    if (!opts.loop) {
      const raw = this.current + dir;
      if (raw < 0 || raw > this.items.length - 1) {
        this.program.uniforms.uProgress.value = 0;
        return;
      }
    }
    if (dir !== this.dragDir) {
      this.dragDir = dir;
      this.prepareNext(dir);
    }
    const progress = Math.min(Math.abs(ndx), 1);
    this.program.uniforms.uProgress.value = progress;
    this.announce(progress > 0.5 ? this.wrap(this.current + dir) : this.current);
  }

  endDrag(): void {
    if (!this.dragging) return;
    this.dragging = false;
    const p = this.program.uniforms.uProgress.value as number;
    if (this.dragDir === 0) return;
    const target = this.wrap(this.current + this.dragDir);
    if (!this.loaded[target]) this.ensureAround(target);
    const duration = this.reducedMotion ? 0.3 : 0.5;
    this.animating = true;
    if (p > 0.4) {
      this.announce(target);
      this.tween = gsap.to(this.program.uniforms.uProgress, {
        value: 1,
        duration,
        ease: 'power2.out',
        onComplete: () => this.commit(target)
      });
    } else {
      this.announce(this.current);
      this.tween = gsap.to(this.program.uniforms.uProgress, {
        value: 0,
        duration,
        ease: 'power2.out',
        onComplete: () => {
          this.animating = false;
          this.tween = null;
        }
      });
    }
  }

  private onContextLost(e: Event): void {
    e.preventDefault();
    cancelAnimationFrame(this.raf);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    if (this.tween) this.tween.kill();
    this.loadTimers.forEach(t => window.clearTimeout(t));
    this.loadTimers = [];
    this.videos.forEach(video => {
      if (!video) return;
      video.pause();
      while (video.firstChild) video.removeChild(video.firstChild);
      if (video.parentNode) video.parentNode.removeChild(video);
      try {
        video.load();
      } catch {}
    });
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('webglcontextlost', this.boundContextLost);
    this.textures.forEach(tex => {
      if (tex && tex.texture) this.gl.deleteTexture(tex.texture);
    });
    if (this.program && this.program.program) this.gl.deleteProgram(this.program.program);
    const ext = this.gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    if (this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
  }
}

export default function MorphSlider({
  items = DEFAULT_ITEMS,
  startIndex = 0,
  transition = 'melt',
  duration = 1.1,
  ease = 'power2.inOut',
  intensity = 0.55,
  scale = 2.4,
  aberration = 0.35,
  drift = 0.4,
  autoplay = false,
  autoplayDelay = 4,
  loop = true,
  radius = 16,
  overlayColor = '#000000',
  showCaptions = true,
  showControls = true,
  showIndicators = true,
  className = '',
  ...props
}: MorphSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MorphEngine | null>(null);
  const [index, setIndex] = useState(startIndex);
  const [hovering, setHovering] = useState(false);
  const [aspect, setAspect] = useState(0.5625);
  const [progress, setProgress] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const isSeekingRef = useRef(false);

  const optsRef = useRef<EngineOptions>({
    transition,
    duration,
    ease,
    intensity,
    scale,
    aberration,
    drift,
    overlayColor,
    loop
  });
  optsRef.current = { transition, duration, ease, intensity, scale, aberration, drift, overlayColor, loop };

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const engine = new MorphEngine(containerRef.current, {
      items,
      startIndex,
      reducedMotion,
      dprCap: 2,
      getOptions: () => optsRef.current,
      onIndexChange: setIndex,
      onAspectChange: setAspect
    });
    engineRef.current = engine;
    setIndex(startIndex);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, startIndex]);

  const handleNext = useCallback(() => engineRef.current?.next(), []);
  const handlePrev = useCallback(() => engineRef.current?.prev(), []);

  useEffect(() => {
    if (!autoplay || hovering) return undefined;
    const id = window.setTimeout(() => engineRef.current?.next(), Math.max(autoplayDelay, 1) * 1000);
    return () => window.clearTimeout(id);
  }, [autoplay, autoplayDelay, hovering, index]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    let startX = 0;
    let width = 1;
    let active = false;
    let maxDx = 0;

    const onDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      width = rect.width || 1;
      startX = e.clientX;
      maxDx = 0;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      engineRef.current?.setPointer(px, 1 - py);
      active = engineRef.current?.beginDrag() ?? false;
      if (active && el.setPointerCapture) {
        try {
          el.setPointerCapture(e.pointerId);
        } catch {}
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const ndx = (e.clientX - startX) / width;
      maxDx = Math.max(maxDx, Math.abs(e.clientX - startX));
      engineRef.current?.drag(ndx);
    };
    const onUp = () => {
      const wasActive = active;
      active = false;
      if (wasActive) engineRef.current?.endDrag();
      // 位移很小 → 视为点击：原地播放/暂停视频
      if (maxDx < 6) engineRef.current?.togglePlay();
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, []);

  // 进度条：跟随当前视频播放进度
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 120) {
        last = t;
        const engine = engineRef.current;
        if (engine && !isSeekingRef.current) setProgress(engine.getProgress());
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const isCurrentVideo =
    items[index]?.type === 'video' || /\.(mp4|webm|ogv|mov)(\?.*)?$/i.test(items[index]?.image ?? '');

  const seekFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    engineRef.current?.seek(ratio);
    setProgress(ratio);
  };

  const onSeekDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    isSeekingRef.current = true;
    setIsSeeking(true);
    engineRef.current?.seekStart();
    seekFromEvent(e);
  };

  const onSeekMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    e.stopPropagation();
    seekFromEvent(e);
  };

  const onSeekUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    e.stopPropagation();
    isSeekingRef.current = false;
    setIsSeeking(false);
    engineRef.current?.seekEnd();
  };

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  const hasCaptions = items.some(item => item.caption);

  return (
    <div
      className={`morph-slider ${className}`.trim()}
      style={
        {
          borderRadius: `${radius}px`,
          width: 'calc(var(--ms-h, 640px) * var(--ms-aspect, 0.5625))',
          height: 'var(--ms-h, 640px)',
          '--ms-aspect': aspect,
          '--ms-swap': `${(duration * 0.66).toFixed(3)}s`,
          '--ms-dot': `${(duration * 0.45).toFixed(3)}s`
        } as CSSProperties
      }
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      {...props}
    >
      <div
        ref={containerRef}
        className="morph-slider-stage"
        role="group"
        aria-roledescription="carousel"
        aria-label="Image morph slider"
        tabIndex={0}
        onKeyDown={onKeyDown}
      />

      {showCaptions && hasCaptions && (
        <div className="morph-slider-caption" aria-live="polite">
          {items.map((item, i) =>
            item.caption ? (
              <span
                key={i}
                aria-hidden={i === index ? undefined : true}
                className={`morph-slider-caption-text ${i === index ? 'is-active' : ''}`}
              >
                {item.caption}
              </span>
            ) : null
          )}
        </div>
      )}

      {showControls && (
        <div className="morph-slider-controls">
          <button type="button" className="morph-slider-btn" aria-label="Previous slide" onClick={handlePrev}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" className="morph-slider-btn" aria-label="Next slide" onClick={handleNext}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

      {showIndicators && (
        <div className="morph-slider-indicators" role="tablist" aria-label="Slides">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className={`morph-slider-dot ${i === index ? 'is-active' : ''}`}
              onClick={() => {
                const engine = engineRef.current;
                if (!engine || i === index) return;
                engine.goTo(i > index ? 1 : -1);
              }}
            />
          ))}
        </div>
      )}

      {isCurrentVideo && (
        <div
          className={`morph-slider-progress ${isSeeking ? 'is-seeking' : ''}`}
          onPointerDown={onSeekDown}
          onPointerMove={onSeekMove}
          onPointerUp={onSeekUp}
          onPointerCancel={onSeekUp}
          role="slider"
          aria-label="播放进度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span className="morph-slider-progress-fill" style={{ width: `${progress * 100}%` }} />
          <span className="morph-slider-progress-handle" style={{ left: `${progress * 100}%` }} />
        </div>
      )}
    </div>
  );
}

