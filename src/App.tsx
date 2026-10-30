import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { initMotion, lockScroll, motion } from './motion';
import { KOP_D, KOP_LIJNEN, KOP_VB } from './kop';
import { KAART } from './kaart';

const contact = {
  phoneDisplay: '056 60 44 64',
  phoneHref: 'tel:+3256604464',
  email: 'vd.steve@hotmail.be',
  street: 'Pand 255-257',
  city: '8790 Waregem',
  route: 'https://www.google.com/maps/dir/?api=1&destination=Pand+255,+8790+Waregem',
  map: 'https://www.google.com/maps?q=Pand+255,+8790+Waregem&output=embed',
};

// Bron: hetpandwaregem.be/winkels-en-bedrijven/t-peerdeke/  (js = Date.getDay(), 0 = zondag)
const uren: { dag: string; tijd: string | null; js: number }[] = [
  { dag: 'Maandag', tijd: '09:00 – 21:00', js: 1 },
  { dag: 'Dinsdag', tijd: null, js: 2 },
  { dag: 'Woensdag', tijd: '09:00 – 21:00', js: 3 },
  { dag: 'Donderdag', tijd: '09:00 – 21:00', js: 4 },
  { dag: 'Vrijdag', tijd: '09:00 – 22:00', js: 5 },
  { dag: 'Zaterdag', tijd: '09:00 – 21:00', js: 6 },
  { dag: 'Zondag', tijd: '10:00 – 20:00', js: 0 },
];

const nav: [string, string][] = [
  ['Over', '#over'],
  ['Aanbod', '#aanbod'],
  ['Kaart', '#kaart'],
  ['Troeven', '#troeven'],
  ['Uren', '#uren'],
  ['Locatie', '#locatie'],
];

function brusselsDag(): number {
  const naam = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Brussels' }).format(new Date());
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(naam);
}

/* Titel die woord per woord uit een masker schuift */
function Split({ as: Tag = 'h2', className, children, hero = false }: { as?: 'h1' | 'h2' | 'h3' | 'p'; className: string; children: string; hero?: boolean }) {
  const woorden = children.split(' ');
  return (
    <Tag className={className} data-split="" data-hero={hero ? '' : undefined}>
      {woorden.map((w, i) => (
        <span key={i}>
          <span className="w">
            <span className="wi">{w}</span>
          </span>
          {i < woorden.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function Btn({ href, children, dark = false, ext = false }: { href: string; children: ReactNode; dark?: boolean; ext?: boolean }) {
  return (
    <a href={href} className={`btn ${dark ? 'btn--dark' : ''}`} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      <span className="btn__l">{children}</span>
      <span className="btn__c">
        <Arrow />
      </span>
    </a>
  );
}

const FB_URL = 'https://www.facebook.com/share/1GrMia19oQ/';

// Echte foto's van de zaak (WebP, meerdere breedtes).
const IMG: Record<string, { w: number[]; alt: string }> = {
  hero: { w: [480, 800, 1280, 1536], alt: 'Zonnig terras van ’t Peerdeke in Het Pand, vol gasten onder de parasols' },
  'hero-m': { w: [480, 640], alt: 'Zonnig terras van ’t Peerdeke in Het Pand, vol gasten onder de parasols' },
  uithangbord: { w: [480, 800, 1086], alt: 'Uithangbord van taverne ’t Peerdeke met de paardenkop' },
  wafels: { w: [480, 800, 1086], alt: 'Twee Brusselse wafels met poedersuiker, vanille-ijs en slagroom' },
  interieur: { w: [480, 800, 1448], alt: 'Interieur met lederen stoelen, houten tafels en grote ramen naar het plein' },
  terras: { w: [480, 800, 1156], alt: 'Gasten op het terras in Het Pand onder de parasols' },
  toog: { w: [480, 800], alt: 'Houten toog met biertap en glazenrekken' },
};
const srcSet = (n: string) => IMG[n].w.map((w) => `/img/${n}-${w}.webp ${w}w`).join(', ');
const src = (n: string) => `/img/${n}-${IMG[n].w[IMG[n].w.length - 1]}.webp`;

function Foto({ img, mobile, sizes = '100vw', mode = 'parallax', shade = false, eager = false, decorative = false }: { img: string; mobile?: string; sizes?: string; mode?: 'parallax' | 'zoom' | 'static'; shade?: boolean; eager?: boolean; decorative?: boolean }) {
  const data = mode === 'parallax' ? { 'data-parallax': '' } : mode === 'zoom' ? { 'data-zoom': '' } : {};
  return (
    <figure className={`ph ${shade ? 'shade' : ''}`} style={{ margin: 0 }} {...data}>
      <div className="ph__m">
        <picture>
          {mobile && <source media="(max-width: 767px)" srcSet={srcSet(mobile)} sizes="100vw" />}
          <img
            src={src(img)}
            srcSet={srcSet(img)}
            sizes={sizes}
            alt={decorative ? '' : IMG[img].alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding={eager ? 'sync' : 'async'}
            {...(eager ? { fetchPriority: 'high' as const } : {})}
          />
        </picture>
      </div>
    </figure>
  );
}

/* Paardenkop uit het logo, in currentColor. Met draw=true komen de lijnen erbij waarmee de loader de kop "tekent". */
function Kop({ className, draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg className={`kop ${className ?? ''}`} viewBox={KOP_VB} aria-hidden="true" focusable="false">
      <path className="kop__f" d={KOP_D} fill="currentColor" fillRule="evenodd" />
      {draw && (
        <g className="kop__l" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {KOP_LIJNEN.map((l, i) => (
            <path key={i} d={l.d} strokeWidth={l.k === 'c' ? 2.4 : 1.15} pathLength={1} data-l={l.l} data-g={l.g} />
          ))}
        </g>
      )}
    </svg>
  );
}

function Preloader() {
  return (
    <div className="pre" aria-hidden="true">
      <div className="pre__in">
        <Kop className="pre__kop" draw />
        <div className="pre__row">
          <div className="pre__half">
            <span className="eyebrow">Koffie</span>
          </div>
          <div className="pre__mark">
            <span className="t-s">’t Peerdeke</span>
          </div>
          <div className="pre__half">
            <span className="eyebrow">Pintje</span>
          </div>
        </div>
      </div>
      <p className="pre__line eyebrow">
        <span style={{ display: 'block' }}>Het Pand · Waregem</span>
      </p>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const togRef = useRef<HTMLButtonElement>(null);

  // Verbergen bij naar beneden scrollen, tonen bij naar boven; donkerder over lichte secties
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      setDark(y > vh * 0.85);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > vh * 0.6);
        last = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Menu openen/sluiten met GSAP (hoogte + gestaffelde links)
  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const gsap = window.gsap;
    const links = el.querySelectorAll('.menu__nav a, .menu__aside > *');
    lockScroll(open);
    if (gsap && motion.on) {
      gsap.killTweensOf([el, links]);
      if (open) {
        gsap.set(el, { visibility: 'visible' });
        gsap.to(el, { height: 'auto', duration: 0.7, ease: 'power3.inOut' });
        gsap.fromTo(links, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05, delay: 0.2 });
      } else {
        gsap.to(links, { autoAlpha: 0, duration: 0.2 });
        gsap.to(el, { height: 0, duration: 0.55, ease: 'power3.inOut', onComplete: () => gsap.set(el, { visibility: 'hidden' }) });
      }
    } else {
      el.style.height = open ? 'auto' : '0px';
      el.style.visibility = open ? 'visible' : 'hidden';
    }
    if (open) el.querySelector<HTMLAnchorElement>('.menu__nav a')?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        togRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const cls = ['hdr', open && 'is-open', !open && hidden && 'is-hidden', dark && 'is-dark'].filter(Boolean).join(' ');

  return (
    <>
      <div className={`scrim ${open ? 'is-on' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <header className={cls}>
        <div className="hdr__in">
          <a href={contact.phoneHref} className="hdr__call">
            Bel ons
          </a>
          <a href="#top" className="hdr__logo" aria-label="’t Peerdeke, naar boven" onClick={() => setOpen(false)}>
            <Kop className="hdr__kop" />
            <span>’t Peerdeke</span>
          </a>
          <button ref={togRef} type="button" className="hdr__tog" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Menu sluiten' : 'Menu openen'} onClick={() => setOpen((o) => !o)}>
            <i />
            <i />
            <i />
          </button>
        </div>
        <div id="menu" ref={menuRef} className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
          <div className="menu__in">
            <ul className="menu__nav">
              {nav.map(([label, href], i) => (
                <li key={href}>
                  <a href={href} className="t-s" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                    <small>0{i + 1}</small>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="menu__aside">
              <div className="menu__img">
                <Foto img="toog" mode="static" sizes="360px" decorative />
              </div>
              <div className="menu__meta">
                <span className="eyebrow dim">Taverne in Het Pand</span>
                <span>
                  {contact.street}, {contact.city}
                </span>
                <a href={contact.phoneHref} tabIndex={open ? 0 : -1}>
                  {contact.phoneDisplay}
                </a>
                <span className="dim">Dinsdag gesloten</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

function brusselsMinuten(): number {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Brussels' }).format(new Date()).split(':').map(Number);
  return (h % 24) * 60 + m;
}

function useNuOpen(tijd: string | null | undefined) {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    if (tijd === undefined) return;
    const check = () => {
      if (!tijd) return setOpen(false);
      const [van, tot] = tijd.split(' – ').map((t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      });
      const nu = brusselsMinuten();
      setOpen(nu >= van && nu < tot);
    };
    check();
    const id = window.setInterval(check, 60000);
    return () => window.clearInterval(id);
  }, [tijd]);
  return open;
}

function Hero({ vandaag }: { vandaag: number | null }) {
  const u = vandaag === null ? undefined : uren.find((x) => x.js === vandaag);
  const open = useNuOpen(u ? u.tijd : undefined);
  return (
    <section id="top" className="hero">
      <Foto img="hero" mobile="hero-m" mode="static" shade eager />
      <div className="hero__c">
        <p className="eyebrow" data-fade="">
          Taverne · Het Pand · Waregem
        </p>
        <Split as="h1" className="t-xl" hero>
          Een koffie, een pintje, iets om te eten.
        </Split>
      </div>
      <div className="hero__info">
        <div className="hi">
          <span className="hi__l">
            Vandaag{open !== null && <span className="hi__s"> · {open ? 'Nu open' : 'Nu gesloten'}</span>}
          </span>
          <span className="hi__v">
            {open !== null && <i className={`dot ${open ? 'is-open' : ''}`} aria-hidden="true" />}
            {u ? (u.tijd ? u.tijd : 'Gesloten') : '—'}
          </span>
        </div>
        <div className="hi">
          <span className="hi__l">Adres</span>
          <span className="hi__v">Pand 255‑257, Waregem</span>
        </div>
        <div className="hi hi--x">
          <span className="hi__l">Terras</span>
          <span className="hi__v">In Het Pand</span>
        </div>
        <a href={contact.phoneHref} className="pill">
          <span>Bel ons</span>
          <Arrow />
        </a>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section id="over" className="wrap intro">
      <p className="eyebrow" data-reveal="">
        ’t Peerdeke
      </p>
      <Split className="t-m">Geniet van een koffie, een vers getapt pintje of bestel iets om je honger te stillen.</Split>
      <div className="intro__q" data-reveal="">
        <p className="p">
          Achter de toog staat een gezin dat Het Pand door en door kent. Wat begon als het plan om ooit een eigen café te hebben, werd een plek waar vaste gasten hun krant lezen bij de eerste koffie, winkelend Waregem even neerstrijkt op het terras en vrienden blijven hangen voor nog eentje.
        </p>
        <p className="p">Geen poespas: een warm welkom, een goed getapt pintje en eerlijk eten zoals thuis.</p>
      </div>
      <div data-reveal="">
        <Btn href="#uren" dark>
          Bekijk de uren
        </Btn>
      </div>
      <div className="intro__img">
        <Foto img="uithangbord" mode="zoom" sizes="(max-width: 767px) 90vw, (max-width: 1024px) 60vw, 560px" />
      </div>
    </section>
  );
}

function Aanbod() {
  const items: [string, ReactNode][] = [
    ['Koffie', 'Vanaf 9 uur ’s morgens. Op zondag vanaf 10 uur.'],
    ['Van ’t vat', 'Een vers getapt pintje, binnen of op het terras.'],
    [
      'Honger?',
      <>
        Bestel iets om je honger te stillen.{' '}
        <a href="#kaart" className="lnk">
          Bekijk de kaart
        </a>
      </>,
    ],
  ];
  return (
    <section id="aanbod" className="split">
      <div className="split__img">
        <Foto img="wafels" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      <div className="split__txt">
        <div className="split__top">
          <p className="eyebrow" data-reveal="">
            Aanbod
          </p>
          <Split className="t-l">Koffie, pintje, honger.</Split>
        </div>
        <div className="split__bottom">
          {items.map(([t, p]) => (
            <div key={t} className="item" data-reveal="">
              <h3 className="t-xs">{t}</h3>
              <p className="p">{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Kaart met tabs (WAI-ARIA tabs-patroon: pijltjes, Home/End, roving tabindex) */
function Kaart() {
  const [actief, setActief] = useState(0);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const lijstRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const kies = (i: number, focus = false) => {
    const n = (i + KAART.length) % KAART.length;
    setActief(n);
    const tab = tabsRef.current[n];
    if (focus) tab?.focus({ preventScroll: true });
    // Actieve tab in beeld schuiven binnen de horizontale lijst (enkel die lijst, niet de pagina)
    const lijst = lijstRef.current;
    if (tab && lijst && lijst.scrollWidth > lijst.clientWidth) {
      const doel = tab.offsetLeft - (lijst.clientWidth - tab.offsetWidth) / 2;
      lijst.scrollTo({ left: doel, behavior: 'smooth' });
    }
  };

  const onKey = (e: ReactKeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: actief + 1, ArrowLeft: actief - 1, Home: 0, End: KAART.length - 1 };
    if (e.key in map) {
      e.preventDefault();
      kies(map[e.key], true);
    }
  };

  useEffect(() => {
    const g = window.gsap;
    if (!motion.on || !g || !panelRef.current) return;
    g.fromTo(panelRef.current.querySelectorAll('.gr'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.035, overwrite: true });
  }, [actief]);

  const r = KAART[actief];
  return (
    <section id="kaart" className="kaart wrap" aria-label="De kaart">
      <div className="kaart__head">
        <p className="eyebrow" data-reveal="">
          De kaart
        </p>
        <Split className="t-l">Iets om je honger te stillen.</Split>
        <p className="kaart__note" data-reveal="">
          Voorbeeldkaart, gerechten en prijzen ter illustratie
        </p>
      </div>
      <div className="kaart__tabs" ref={lijstRef} role="tablist" aria-label="Rubrieken van de kaart" onKeyDown={onKey}>
        {KAART.map((k, i) => (
          <button
            key={k.id}
            ref={(el) => {
              tabsRef.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${k.id}`}
            aria-selected={i === actief}
            aria-controls={`paneel-${k.id}`}
            tabIndex={i === actief ? 0 : -1}
            className={`tab ${i === actief ? 'is-on' : ''}`}
            onClick={() => kies(i)}
          >
            {k.tab}
          </button>
        ))}
      </div>
      <div ref={panelRef} className="kaart__panel" role="tabpanel" id={`paneel-${r.id}`} aria-labelledby={`tab-${r.id}`} tabIndex={0}>
        <p className="kaart__intro">{r.intro}</p>
        <ul className="kaart__lijst">
          {r.items.map((g) => (
            <li key={g.n} className="gr">
              <div className="gr__r">
                <span className="gr__n">{g.n}</span>
                <span className="gr__d" aria-hidden="true" />
                <span className="gr__p">
                  <span className="sr">Prijs: </span>€&nbsp;{g.p}
                </span>
              </div>
              {g.o && <p className="gr__o">{g.o}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Terras() {
  return (
    <section className="full shade" aria-label="Terras">
      <Foto img="terras" />
      <div className="full__c">
        <p className="eyebrow" data-reveal="">
          Terras
        </p>
        <Split className="t-xl">Buiten zitten in Het Pand.</Split>
      </div>
    </section>
  );
}

function Troeven() {
  return (
    <section id="troeven" className="split split--rev split--salie">
      <div className="split__img">
        <Foto img="interieur" sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      <div className="split__txt">
        <div className="split__top">
          <p className="eyebrow" data-reveal="">
            Goed om te weten
          </p>
          <Split className="t-l">Binnen, buiten, voor iedereen.</Split>
        </div>
        <div className="split__bottom">
          <div className="item" data-reveal="">
            <h3 className="t-xs">Terras</h3>
            <p className="p">Bij goed weer zit je buiten.</p>
          </div>
          <div className="item" data-reveal="">
            <h3 className="t-xs">Toegankelijk</h3>
            <p className="p">Rolstoeltoegankelijk.</p>
          </div>
          <div className="item" data-reveal="">
            <h3 className="t-xs">Het Pand</h3>
            <p className="p">{contact.street}, in Het Pand in Waregem.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Uren({ vandaag }: { vandaag: number | null }) {
  return (
    <section id="uren" className="wrap uren">
      <div className="uren__head">
        <p className="eyebrow" data-reveal="">
          Openingsuren
        </p>
        <Split className="t-l">Zes dagen open.</Split>
        <p className="p dim" data-reveal="">
          Dinsdag is ’t Peerdeke gesloten.
        </p>
        <div data-reveal="">
          <Btn href={contact.phoneHref} dark>
            {contact.phoneDisplay}
          </Btn>
        </div>
      </div>
      <ul className="uren__list" data-rows="">
        {uren.map((u) => (
          <li key={u.dag} className={u.js === vandaag ? 'nu' : ''}>
            <span className="d">{u.dag}</span>
            <span className={`u ${u.tijd ? '' : 'dicht'}`}>{u.tijd ?? 'Gesloten'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Locatie() {
  return (
    <section id="locatie" className="loc">
      <div className="loc__txt">
        <div style={{ display: 'grid', gap: '1.75em' }}>
          <p className="eyebrow" data-reveal="">
            Locatie & contact
          </p>
          <Split className="t-l">In Het Pand, Waregem.</Split>
        </div>
        <div className="loc__rows" data-rows="">
          <div>
            <span className="eyebrow dim">Adres</span>
            <span>
              {contact.street}
              <br />
              {contact.city}
            </span>
          </div>
          <div>
            <span className="eyebrow dim">Telefoon</span>
            <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
          </div>
          <div>
            <span className="eyebrow dim">E-mail</span>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
          <div>
            <span className="eyebrow dim">Socials</span>
            <span className="socials">
              <a href={FB_URL} target="_blank" rel="noopener" aria-label="’t Peerdeke op Facebook (opent in een nieuw venster)">
                Facebook
              </a>
            </span>
          </div>
        </div>
        <div data-reveal="">
          <Btn href={contact.route} dark ext>
            Plan je route
          </Btn>
        </div>
      </div>
      <div className="loc__map" data-zoom="">
        <iframe title="Kaart: ’t Peerdeke, Pand 255-257, Waregem" src={contact.map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
    </section>
  );
}

function Footer() {
  const merk = '’t Peerdeke';
  const markRef = useRef<HTMLDivElement>(null);
  // Woordmerk exact binnen de container laten passen (nooit tegen of over de rand)
  useEffect(() => {
    const el = markRef.current;
    if (!el) return;
    // Vroeger: max-width:100% kapte de max-content-meting af, waardoor de tekst nooit kleiner werd.
    // Nu meten we de breedte van de binnenste inline-block-span (niet begrensd door de container).
    const inner = el.firstElementChild as HTMLElement | null;
    const fit = () => {
      if (!inner) return;
      el.style.fontSize = '100px';
      const nodig = inner.getBoundingClientRect().width;
      const cs = getComputedStyle(el);
      const beschikbaar = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (nodig > 0) el.style.fontSize = `${Math.max(12, Math.floor((100 * beschikbaar * 0.985) / nodig))}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    document.fonts?.addEventListener?.('loadingdone', fit);
    let lastW = 0;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === lastW) return;
      lastW = el.clientWidth;
      fit();
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', fit);
    };
  }, []);
  return (
    <footer className="foot">
      <div className="foot__brand">
        <Kop className="foot__kop" />
        <span className="t-s">’t Peerdeke</span>
      </div>
      <div className="foot__top">
        <div>
          <p className="eyebrow">Adres</p>
          <span>{contact.street}</span>
          <span>{contact.city}</span>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={FB_URL} target="_blank" rel="noopener" className="fb" aria-label="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21h3.1z" />
            </svg>
          </a>
        </div>
        <div>
          <p className="eyebrow">Uren</p>
          <span>Ma, wo, do, za 09–21</span>
          <span>Vr 09–22 · Zo 10–20</span>
          <span>Di gesloten</span>
        </div>
        <div>
          <p className="eyebrow">Menu</p>
          {nav.map(([l, h]) => (
            <a key={h} href={h}>
              {l}
            </a>
          ))}
        </div>
      </div>
      <div ref={markRef} className="foot__mark" data-chars="" role="img" aria-label={merk}>
        <span className="foot__mark-in">
          {[...merk].map((c, i) => (
            <span key={i} className="w" aria-hidden="true">
              <span className="wi ci">{c === ' ' ? '\u00a0' : c}</span>
            </span>
          ))}
        </span>
      </div>
      <div className="foot__bot">
        <span>© {new Date().getFullYear()} ’t Peerdeke · Taverne in Het Pand</span>
        <span>BTW BE 0000.000.000</span>
      </div>
    </footer>
  );
}

export default function App() {
  const [vandaag, setVandaag] = useState<number | null>(null);
  useEffect(() => setVandaag(brusselsDag()), []);
  useEffect(() => initMotion(), []);
  return (
    <>
      <Preloader />
      <Header />
      <main>
        <Hero vandaag={vandaag} />
        <Intro />
        <Aanbod />
        <Kaart />
        <Terras />
        <Troeven />
        <Uren vandaag={vandaag} />
        <Locatie />
      </main>
      <Footer />
    </>
  );
}
