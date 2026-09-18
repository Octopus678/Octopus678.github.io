import { useState } from "react";
import { useReveal } from "./hooks/useReveal";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Works from "./components/Works";
import Strengths from "./components/Strengths";
import Closing from "./components/Closing";
import Intro from "./components/Intro/Intro";
import MoltenMetal from "./components/MoltenMetal/MoltenMetal";
import "./index.css";
import "./site.css";

const MOLTEN_PROPS = {
  color1: "#2a0802",
  color2: "#ff5a36",
  color3: "#ffd9b0",
  speed: 0.4,
  scale: 3.4,
  detail: 3,
  glow: 1.9,
  coreSize: 0.12,
  swirl: 1.1,
  fold: -0.25,
  blackPoint: 0.14,
  brightness: 1.15,
  colorMode: "ember",
  grain: true,
  grainIntensity: 0.06,
  mouseInteraction: true,
  mouseStrength: 0.25,
  opacity: 0.34,
};

export default function App() {
  useReveal();
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <div className="site-bg" aria-hidden="true">
        <img src="/bg.jpg" alt="" />
        <span className="site-bg-shade" />
      </div>
      <div className="molten-bg-fixed" aria-hidden="true">
        <MoltenMetal {...MOLTEN_PROPS} />
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="site-root">
        <Nav />
        <main>
          <Hero />
          <About />
          <Works />
          <Strengths />
          <Closing />
        </main>
      </div>
      {introDone ? null : <Intro onDone={() => setIntroDone(true)} />}
    </>
  );
}
