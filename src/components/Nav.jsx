import { useEffect, useState } from "react";

const LINKS = [
  { href: "#about", label: "关于" },
  { href: "#works", label: "作品" },
  { href: "#strengths", label: "优势" },
  { href: "#contact", label: "联系" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
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
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <a href="#top" className="nav-logo">
          <span className="dot" aria-hidden="true" />
          JIN&nbsp;HAOYU
          <small>剪辑工作室</small>
        </a>
        <nav>
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={active === l.href.slice(1) ? "active" : ""}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#contact" className="nav-cta latin">
          联系我
        </a>
      </div>
    </header>
  );
}
