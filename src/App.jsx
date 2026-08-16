import { useReveal } from "./hooks/useReveal";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Works from "./components/Works";
import Strengths from "./components/Strengths";
import Closing from "./components/Closing";
import "./index.css";
import "./site.css";

export default function App() {
  useReveal();

  return (
    <>
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
