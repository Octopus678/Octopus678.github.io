import { useReveal } from "./hooks/useReveal";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Works from "./components/Works";
import Strengths from "./components/Strengths";
import Closing from "./components/Closing";
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
  opacity: 0.5,
};

export default function App() {
  useReveal();

  return (
    <>
      <div className="molten-bg-fixed" aria-hidden="true">
        <MoltenMetal {...MOLTEN_PROPS} />
      </div>
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <About />
        <Works />
        <Strengths />
        <Closing />
      </main>
    </>
  );
}
