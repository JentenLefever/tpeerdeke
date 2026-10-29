import { useEffect, useRef, useState, type ReactNode } from 'react';
import { initMotion, lockScroll, motion } from './motion';

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

/* Bewuste plaatshouder tot er echte foto's zijn */
function Foto({ label, tint, mode = 'parallax', shade = false }: { label: string; tint: string; mode?: 'parallax' | 'zoom' | 'static'; shade?: boolean }) {
  const data = mode === 'parallax' ? { 'data-parallax': '' } : mode === 'zoom' ? { 'data-zoom': '' } : {};
  return (
    <figure className={`ph ph--${tint} ${shade ? 'shade' : ''}`} style={{ margin: 0 }} role="img" aria-label={`Plaatshouder: ${label}`} {...data}>
      <div className="ph__m" />
      <figcaption className="ph__cap">{label}</figcaption>
    </figure>
  );
}

function Preloader() {
  return (
    <div className="pre" aria-hidden="true">
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
            ’t Peerdeke
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
                <Foto label="[Foto toog]" tint="toog" mode="static" />
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

function Hero({ vandaag }: { vandaag: number | null }) {
  const u = vandaag === null ? null : uren.find((x) => x.js === vandaag);
  return (
    <section id="top" className="hero">
      <Foto label="[Foto gevel of terras]" tint="int" mode="static" shade />
      <div className="hero__c">
        <p className="eyebrow" data-fade="">
          Taverne · Het Pand · Waregem
        </p>
        <Split as="h1" className="t-xl" hero>
          Een koffie, een pintje, iets om te eten.
        </Split>
      </div>
      <span className="scrollhint" data-fade="">
        Scroll
      </span>
      <div className="hero__bar">
        <div>
          <span className="eyebrow dim">Vandaag</span>
          <strong>{u ? (u.tijd ?? 'Gesloten') : '—'}</strong>
        </div>
        <div>
          <span className="eyebrow dim">Adres</span>
          <strong>{contact.street}</strong>
        </div>
        <div>
          <span className="eyebrow dim">Troeven</span>
          <strong>Terras</strong>
        </div>
        <a href={contact.phoneHref} className="bel">
          <span className="eyebrow">Bel ons</span>
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
        <span className="todo">[Eigen verhaal: wie staat achter de toog, sinds wanneer]</span>
      </div>
      <div data-reveal="">
        <Btn href="#uren" dark>
          Bekijk de uren
        </Btn>
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
        Bestel iets om je honger te stillen. <span className="todo" style={{ marginTop: '0.75em' }}>[Menukaart]</span>
      </>,
    ],
  ];
  return (
    <section id="aanbod" className="split">
      <div className="split__img">
        <Foto label="[Foto pintje]" tint="pint" />
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

function Terras() {
  return (
    <section className="full shade" aria-label="Terras">
      <Foto label="[Foto terras]" tint="terras" />
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
        <Foto label="[Foto interieur]" tint="int" />
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
            <span>
              <span className="todo">[Facebook / Instagram]</span>
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
  return (
    <footer className="foot">
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
      <div className="foot__mark" data-chars="" aria-label={merk}>
        {[...merk].map((c, i) => (
          <span key={i} className="w" aria-hidden="true">
            <span className="wi ci">{c === ' ' ? '\u00a0' : c}</span>
          </span>
        ))}
      </div>
      <div className="foot__bot">
        <span>© {new Date().getFullYear()} ’t Peerdeke · Taverne in Het Pand</span>
        <span>[Ondernemingsnummer]</span>
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
        <Terras />
        <Troeven />
        <Uren vandaag={vandaag} />
        <Locatie />
      </main>
      <Footer />
    </>
  );
}
