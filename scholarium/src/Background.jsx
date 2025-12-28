import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

const Background = memo(function Background() {
  const [init, setInit] = useState(false);
  const [particleCount] = useState(150);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback((container) => {
    console.log(container);
  }, []);

  const options = useMemo(() => ({
    fullScreen: { enable: true, zIndex: 0 },
    background: { color: { value: "transparent" } },
    fpsLimit: 120,
    particles: {
      color: { value: "#ffffff" },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: true,
        speed: 1,
        straight: false,
      },
      number: { density: { enable: true }, value: particleCount },
      opacity: { value: 1.0 },
      shape: { type: "square" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  }), [particleCount]);

  return init ? (
    <Particles
      particlesLoaded={particlesLoaded}
      options={options}
    />
  ) : null;
});

export default Background;
