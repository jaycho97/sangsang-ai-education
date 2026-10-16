/* Photographic prism interaction. No dependencies, network calls, or page-wide motion. */
(() => {
  "use strict";
  let liveInstance = false;
  function startHeroEffects() {
    if (liveInstance) return;
    const hero = document.getElementById("hero");
    const canvas = document.getElementById("hero-light");
    if (!hero || !(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    liveInstance = true;
    const visual = hero.querySelector(".hero-visual");
    const focusButton = document.getElementById("hero-focus");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let ratio = 1;
    let raf = 0;
    let previousPaint = 0;
    let inView = true;
    let startedAt = 0;
    let pointer = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let focusTimer = 0;
    let disposed = false;
    let burstSequence = 0;
    const bursts = [];
    const palette = ["255,128,111", "255,169,71", "243,207,68", "102,211,159", "71,192,229", "99,145,246", "172,124,239"];
    let seed = 3481;
    const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
    const particles = Array.from({ length: 125 }, (_, index) => ({
      lane: index % palette.length, at: random(), spread: (random() - .5) * 26,
      size: .5 + random() * 1.2, alpha: .18 + random() * .45,
      phase: random() * Math.PI * 2,
    }));
    const glints = Array.from({ length: 27 }, () => ({
      x: .56 + random() * .35, y: .17 + random() * .55,
      phase: random() * Math.PI * 2, size: 1 + random() * 2.3,
    }));
    const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
    const lerp = (a, b, t) => a + (b - a) * t;
    const focalPoint = () => ({
      x: width * (Number(hero.dataset.prismX) || .69) + pointer.x * width * .018,
      y: height * (Number(hero.dataset.prismY) || .53) + pointer.y * height * .022,
    });
    const spectrumEnd = (lane, time, energy) => ({
      x: width * 1.14,
      y: height * (.735 + lane * .035 + pointer.y * .12 + Math.sin(time * .7 + lane * .22) * .009 + energy * (lane - 3) * .007),
    });
    const line = (from, to, color, lineWidth) => {
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.stroke();
    };
    const star = (x, y, radius, alpha, color = "255,255,255") => {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 5);
      glow.addColorStop(0, `rgba(${color},${alpha})`);
      glow.addColorStop(.2, `rgba(${color},${alpha * .35})`);
      glow.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = glow; ctx.fillRect(x - radius * 5, y - radius * 5, radius * 10, radius * 10);
      line({ x: x - radius * 3, y }, { x: x + radius * 3, y }, `rgba(${color},${alpha * .8})`, .7);
      line({ x, y: y - radius * 3 }, { x, y: y + radius * 3 }, `rgba(${color},${alpha * .8})`, .7);
    };
    const draw = (now) => {
      const staticMode = motionQuery.matches;
      const time = staticMode ? 0 : (now - startedAt) / 1000;
      const entrance = staticMode ? 1 : clamp(time / 1.2);
      const easeEntrance = 1 - (1 - entrance) ** 3;
      pointer.x = lerp(pointer.x, staticMode ? 0 : target.x, .08);
      pointer.y = lerp(pointer.y, staticMode ? 0 : target.y, .08);
      const focus = focalPoint();
      let energy = 0;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const age = (now - bursts[i].at) / 1000;
        if (age > 1.35) bursts.splice(i, 1);
        else energy += Math.exp(-age * 3.5) * 1.25;
      }
      energy = Math.min(energy, 1.65);
      if (visual && !staticMode) {
        hero.style.setProperty("--hero-shift-x", `${pointer.x * 24}px`);
        hero.style.setProperty("--hero-shift-y", `${pointer.y * 18}px`);
        hero.style.setProperty("--hero-rotate-x", `${pointer.y * -1.8}deg`);
        hero.style.setProperty("--hero-rotate-y", `${pointer.x * 2.4}deg`);
        hero.style.setProperty("--hero-art-scale", `${1.018 + energy * .012}`);
        hero.style.setProperty("--hero-art-saturation", `${1.03 + energy * .27}`);
        hero.style.setProperty("--hero-art-brightness", `${1 + energy * .035}`);
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = easeEntrance;
      ctx.globalCompositeOperation = "source-over";
      const source = { x: width * -.05, y: height * (.025 + pointer.y * .08) };
      const white = ctx.createLinearGradient(source.x, source.y, focus.x, focus.y);
      white.addColorStop(0, "rgba(255,255,255,0)");
      white.addColorStop(.44, "rgba(255,255,255,.38)");
      white.addColorStop(1, `rgba(255,255,255,${.85 + energy * .1})`);
      ctx.shadowColor = "rgba(255,255,255,.9)"; ctx.shadowBlur = 15 + energy * 15;
      line(source, focus, white, 1.8 + energy * 1.3);
      ctx.shadowBlur = 0;
      line(source, focus, "rgba(255,255,255,.08)", 14 + energy * 10);

      // Fine spectral filaments sit on top of the photographic dispersion.
      palette.forEach((color, lane) => {
        const end = spectrumEnd(lane, time, energy);
        const beam = ctx.createLinearGradient(focus.x, focus.y, end.x, end.y);
        beam.addColorStop(0, "rgba(255,255,255,.8)");
        beam.addColorStop(.13, `rgba(${color},${.3 + energy * .2})`);
        beam.addColorStop(.58, `rgba(${color},${.27 + energy * .18})`);
        beam.addColorStop(1, `rgba(${color},0)`);
        ctx.shadowColor = `rgba(${color},.3)`; ctx.shadowBlur = 9;
        line(focus, end, beam, 1.55 + energy * .9);
        ctx.shadowBlur = 0;
        const halo = ctx.createLinearGradient(focus.x, focus.y, end.x, end.y);
        halo.addColorStop(0, `rgba(${color},0)`);
        halo.addColorStop(.4, `rgba(${color},${.025 + energy * .03})`);
        halo.addColorStop(1, `rgba(${color},0)`);
        line(focus, end, halo, 18 + energy * 14);
        bursts.forEach((burst) => {
          const travel = (now - burst.at) / 650;
          if (travel < 0 || travel > 1.2) return;
          const from = clamp(travel - .16);
          const to = clamp(travel);
          ctx.shadowColor = `rgba(${color},.6)`; ctx.shadowBlur = 9;
          line({ x: lerp(focus.x, end.x, from), y: lerp(focus.y, end.y, from) }, { x: lerp(focus.x, end.x, to), y: lerp(focus.y, end.y, to) }, `rgba(${color},${(1 - clamp(travel / 1.2)) * .65})`, 2.3);
          ctx.shadowBlur = 0;
        });
      });
      particles.forEach((point) => {
        const at = (point.at + time * (.055 + point.lane * .0015)) % 1;
        const end = spectrumEnd(point.lane, time, energy);
        const x = lerp(focus.x, end.x, at);
        const y = lerp(focus.y, end.y, at) + point.spread * at;
        ctx.fillStyle = `rgba(${palette[point.lane]},${Math.sin(at * Math.PI) * point.alpha * (.65 + energy * .6)})`;
        ctx.beginPath(); ctx.arc(x, y, point.size, 0, Math.PI * 2); ctx.fill();
      });
      glints.forEach((point) => {
        const twinkle = Math.max(0, Math.sin(time * .65 + point.phase)) ** 12;
        if (twinkle < .06) return;
        star(point.x * width + pointer.x * 8, point.y * height + pointer.y * 5, point.size * (1 + energy * .5), twinkle * (.65 + energy * .2));
      });
      star(focus.x, focus.y, 7 + energy * 11, .84);

      // A short, localized flash and a spray of spectral motes respond to a click.
      bursts.forEach((burst) => {
        const age = clamp((now - burst.at) / 1350);
        const radius = (1 - (1 - age) ** 3) * Math.min(width * .17, 250);
        const fade = (1 - age) ** 2;
        ctx.beginPath(); ctx.arc(focus.x, focus.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(174,186,231,${fade * .18})`; ctx.lineWidth = .8; ctx.stroke();
        for (let i = 0; i < 72; i++) {
          const angle = (i * 2.399963 + burst.index * .4);
          const distance = radius * (.45 + (i % 7) / 10);
          const x = focus.x + Math.cos(angle) * distance;
          const y = focus.y + Math.sin(angle) * distance * .72;
          ctx.fillStyle = `rgba(${palette[i % 7]},${fade * .84})`;
          ctx.beginPath(); ctx.arc(x, y, 1.2 + (i % 3) * .55, 0, Math.PI * 2); ctx.fill();
          if (i % 3 === 0) line({ x: focus.x + Math.cos(angle) * distance * .9, y: focus.y + Math.sin(angle) * distance * .72 * .9 }, { x, y }, `rgba(${palette[i % 7]},${fade * .38})`, .8);
        }
        star(focus.x, focus.y, 6 + (1 - age) * 15, fade * .9);
      });
      ctx.globalAlpha = 1;
    };
    const animate = (now) => {
      if (disposed) return;
      if (!startedAt) startedAt = now;
      if (now - previousPaint >= 1000 / 45) { draw(now); previousPaint = now; }
      raf = requestAnimationFrame(animate);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (disposed || document.hidden || !inView) return;
      if (motionQuery.matches) draw(performance.now());
      else raf = requestAnimationFrame(animate);
    };
    const resize = () => {
      const bounds = hero.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      if (!document.hidden && inView) draw(performance.now());
    };
    const onPointerMove = (event) => {
      if (motionQuery.matches || event.pointerType === "touch") return;
      const bounds = hero.getBoundingClientRect();
      target.x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * 2 - 1;
      target.y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1) * 2 - 1;
    };
    const onPointerLeave = () => { target = { x: 0, y: 0 }; };
    const trigger = () => {
      if (motionQuery.matches) return;
      bursts.push({ at: performance.now(), index: burstSequence++ });
      if (bursts.length > 3) bursts.shift();
      hero.classList.add("is-light-focusing");
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => hero.classList.remove("is-light-focusing"), 950);
    };
    const onHeroClick = (event) => {
      if (event.target.closest("a,button,input,select,textarea")) return;
      const bounds = hero.getBoundingClientRect();
      if (event.clientX > bounds.left + bounds.width * .5) trigger();
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: .02 });
    const resizeObserver = new ResizeObserver(resize);
    const onMotionChange = () => {
      if (motionQuery.matches) {
        target = { x: 0, y: 0 }; pointer = { x: 0, y: 0 }; bursts.length = 0;
        ["--hero-shift-x", "--hero-shift-y", "--hero-rotate-x", "--hero-rotate-y", "--hero-art-scale", "--hero-art-saturation", "--hero-art-brightness"].forEach((property) => hero.style.removeProperty(property));
      }
      sync();
    };
    const cleanup = () => {
      disposed = true; liveInstance = false; cancelAnimationFrame(raf); clearTimeout(focusTimer);
      hero.classList.remove("is-light-focusing");
      observer.disconnect(); resizeObserver.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      hero.removeEventListener("click", onHeroClick);
      focusButton?.removeEventListener("click", trigger);
      document.removeEventListener("visibilitychange", sync);
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("pagehide", cleanup);
    };
    hero.classList.add("hero-enhanced");
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);
    hero.addEventListener("click", onHeroClick);
    focusButton?.addEventListener("click", trigger);
    document.addEventListener("visibilitychange", sync);
    motionQuery.addEventListener("change", onMotionChange);
    window.addEventListener("pagehide", cleanup, { once: true });
    observer.observe(hero); resizeObserver.observe(hero);
    startedAt = performance.now(); resize(); sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startHeroEffects, { once: true });
  else startHeroEffects();
  // A BFCache restore keeps the document, but the pagehide lifecycle disposed its old loop.
  window.addEventListener("pageshow", (event) => { if (event.persisted) startHeroEffects(); });
})();
