/* eslint-disable @typescript-eslint/no-explicit-any */
// Animatielaag: GSAP + ScrollTrigger + Lenis (via CDN, defer in index.html).
// Valt netjes terug op een statische pagina bij prefers-reduced-motion of als de scripts niet laden.

declare global {
  interface Window { gsap?: any; ScrollTrigger?: any; Lenis?: any }
}

export const motion: { lenis: any | null; on: boolean } = { lenis: null, on: false };

const html = document.documentElement;

export function canAnimate() {
  return html.classList.contains('anim') && !!window.gsap && !!window.ScrollTrigger;
}

export function scrollToHash(hash: string) {
  const el = hash === '#top' ? document.body : document.querySelector(hash);
  if (!el) return;
  if (motion.lenis) motion.lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else (el as HTMLElement).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

export function lockScroll(lock: boolean) {
  if (motion.lenis) (lock ? motion.lenis.stop() : motion.lenis.start());
  document.body.style.overflow = lock ? 'hidden' : '';
}

export function initMotion(): () => void {
  if (!canAnimate()) {
    html.classList.remove('anim');
    window.dispatchEvent(new Event('preloaderComplete'));
    return () => {};
  }
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  motion.on = true;

  // Smooth scroll (Lenis) gekoppeld aan de GSAP-ticker
  let tick: ((t: number) => void) | null = null;
  if (window.Lenis) {
    const lenis = new window.Lenis({ duration: 1.15, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    motion.lenis = lenis;
    lenis.on('scroll', ST.update);
    tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  const ctx = gsap.context(() => {
    // Beginstanden (preloader dekt alles af, dus geen flits)
    gsap.set('[data-split] .wi', { yPercent: 110 });
    gsap.set('.hdr', { autoAlpha: 0, y: -10 });
    gsap.set('.hero .ph__m', { scale: 1.15 });
    gsap.set('.hero [data-fade]', { autoAlpha: 0, y: 16 });
    gsap.set('.hero__info', { yPercent: 30, autoAlpha: 0 });

    // Preloader
    const pre = document.querySelector('.pre');
    const intro = gsap.timeline({ paused: true });
    intro
      .to('.hero .ph__m', { scale: 1, duration: 2, ease: 'power2.out' }, 0.1)
      .to('.hero [data-split] .wi', { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: { amount: 0.4 } }, 0.2)
      .to('.hero [data-fade]', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.6)
      .to('.hdr', { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.5)
      .to('.hero__info', { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.out' }, 0.75)
      .set('.hdr', { clearProps: 'transform' });

    const done = () => {
      window.dispatchEvent(new Event('preloaderComplete'));
      motion.lenis?.start();
      intro.play();
    };

    if (pre) {
      // 1) de paardenkop wordt lijn per lijn getekend (oren, manen, kop, oog, halster, neus/mond, hals), als met een pen:
      //    elke lijn eigen tempo, licht overlappend; daarna vult de kop zacht in.
      // 2) Koffie en Pintje schuiven uit elkaar en maken plaats voor ’t Peerdeke (de oude v2-loader). 3) alles veegt weg.
      const lijnen = Array.from(pre.querySelectorAll<SVGPathElement>('.pre__kop .kop__l path'));
      const vlak = pre.querySelector('.pre__kop .kop__f');
      gsap.set(lijnen, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(vlak, { fillOpacity: 0 });
      const mark = pre.querySelector<HTMLElement>('.pre__mark');
      const markHalf = () => (mark ? mark.offsetWidth / 2 : 0);
      gsap.set('.pre__half:first-child', { x: markHalf() });
      gsap.set('.pre__half:last-child', { x: -markHalf() });
      const tl = gsap.timeline();
      // pen-planning: vaste pseudo-willekeur zodat het elke keer even "menselijk" oogt
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      let t = 0;
      let vorigeGroep = -1;
      const plan = lijnen.map((el) => {
        const l = parseFloat(el.dataset.l || '20');
        const g = parseInt(el.dataset.g || '0', 10);
        if (g !== vorigeGroep && vorigeGroep !== -1) t += 0.025; // korte adempauze bij een nieuw onderdeel
        vorigeGroep = g;
        const dur = (0.14 + 0.42 * Math.sqrt(l / 300)) * (0.8 + rnd() * 0.45);
        const start = t;
        t += dur * (0.16 + rnd() * 0.08);
        return { el, start, dur };
      });
      const einde = Math.max(...plan.map((p) => p.start + p.dur), 0.01);
      const k = 1.05 / einde; // hele tekening in ~1 s
      const eases = ['power1.inOut', 'sine.inOut', 'power2.out', 'none'];
      plan.forEach((p, i) => {
        tl.to(p.el, { strokeDashoffset: 0, duration: p.dur * k, ease: eases[i % eases.length] }, p.start * k);
      });
      tl.to(vlak, { fillOpacity: 1, duration: 0.3, ease: 'sine.inOut' }, 0.85)
        // alleen transform/opacity: de helften staan eerst tegen elkaar (naar het midden geschoven) en schuiven open
        .fromTo('.pre__half span', { yPercent: 110, y: 0 }, { yPercent: 0, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.04 }, 0.45)
        .fromTo('.pre__half:first-child', { x: () => markHalf() }, { x: 0, duration: 0.6, ease: 'power3.inOut' }, 0.55)
        .fromTo('.pre__half:last-child', { x: () => -markHalf() }, { x: 0, duration: 0.6, ease: 'power3.inOut' }, 0.55)
        .fromTo('.pre__mark span', { yPercent: -110, y: 0 }, { yPercent: 0, y: 0, duration: 0.6, ease: 'power3.inOut' }, 0.62)
        .from('.pre__line', { autoAlpha: 0, duration: 0.35 }, 0.7);

      let exited = false;
      const exit = () => {
        if (exited) return;
        exited = true;
        gsap.timeline({ delay: 0.05 })
          .to('.pre__half span, .pre__mark span, .pre__line', { yPercent: 110, duration: 0.3, ease: 'power3.in', stagger: 0.02 })
          .to('.pre__kop', { autoAlpha: 0, y: -12, duration: 0.3, ease: 'power3.in' }, 0)
          .add(done, '-=0.1')
          .to(pre, { yPercent: -100, duration: 0.5, ease: 'power3.inOut' }, '-=0.1')
          .set(pre, { display: 'none' });
      };
      const ready = () => tl.then(exit);
      if (document.readyState === 'complete') ready();
      else window.addEventListener('load', ready, { once: true });
      window.setTimeout(exit, 6000); // failsafe
    } else done();

    // Titels: woord per woord uit een masker
    gsap.utils.toArray('[data-split]:not(.hero [data-split])').forEach((el: Element) => {
      gsap.to(el.querySelectorAll('.wi'), {
        yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    });

    // Tekstblokken
    gsap.utils.toArray('[data-reveal]').forEach((el: Element) => {
      gsap.from(el, {
        autoAlpha: 0, y: 24, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    });

    // Parallax op beelden
    gsap.utils.toArray('[data-parallax]').forEach((el: Element) => {
      const media = el.querySelector('.ph__m');
      if (!media) return;
      gsap.fromTo(media, { yPercent: -8, scale: 1.15 }, {
        yPercent: 8, scale: 1.15, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Beelden die openen (clip + zoom-out)
    gsap.utils.toArray('[data-zoom]').forEach((el: Element) => {
      const media = el.querySelector('.ph__m');
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
        .from(el, { clipPath: 'inset(12% 8% 12% 8%)', duration: 1.4, ease: 'power3.out' })
        .from(media || {}, { scale: 1.2, duration: 1.6, ease: 'power2.out' }, 0);
    });

    // Lijnen in lijsten (uren)
    gsap.utils.toArray('[data-rows]').forEach((el: Element) => {
      gsap.from(el.children, {
        autoAlpha: 0, y: 18, duration: 0.8, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    // Groot woordmerk in de footer: letter per letter
    gsap.utils.toArray('[data-chars]').forEach((el: Element) => {
      gsap.from(el.querySelectorAll('.ci'), {
        yPercent: 105, duration: 1.1, ease: 'power4.out', stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      });
    });
  });

  // Ankerlinks via Lenis
  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a || a.getAttribute('href') === '#') return;
    e.preventDefault();
    scrollToHash(a.getAttribute('href')!);
  };
  document.addEventListener('click', onClick);

  const onLoad = () => ST.refresh();
  window.addEventListener('load', onLoad);
  document.fonts?.ready.then(() => ST.refresh());

  return () => {
    document.removeEventListener('click', onClick);
    window.removeEventListener('load', onLoad);
    ctx.revert();
    if (tick) gsap.ticker.remove(tick);
    motion.lenis?.destroy();
    motion.lenis = null;
    motion.on = false;
  };
}
