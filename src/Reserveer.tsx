// Reserveer-pop-up in de stijl van de kaart (inkt, crème, goud).
// Er is geen backend: het formulier stelt een e-mail op (mailto:) naar het echte adres van de zaak,
// met alle velden ingevuld. Er wordt niets "verzonden" door de site zelf.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { lockScroll, motion } from './motion';

export const RESERVEER_EVENT = 'reserveer:open';
export const openReserveer = () => window.dispatchEvent(new Event(RESERVEER_EVENT));

type Props = {
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  uren: { dag: string; tijd: string | null; js: number }[];
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function vandaagIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function Reserveer({ email, phoneDisplay, phoneHref, uren }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fout, setFout] = useState('');
  const [klaar, setKlaar] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onOpen = () => {
      opener.current = document.activeElement as HTMLElement | null;
      setFout('');
      setKlaar(false);
      setMounted(true);
      setOpen(true);
    };
    window.addEventListener(RESERVEER_EVENT, onOpen);
    return () => window.removeEventListener(RESERVEER_EVENT, onOpen);
  }, []);

  // openen/sluiten: scrim faden, paneel schuift in, inhoud gestaffeld (zelfde gevoel als het menu)
  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!mounted || !root || !panel) return;
    const gsap = window.gsap;
    const kids = panel.querySelectorAll('[data-in]');
    const mobiel = window.matchMedia('(max-width: 767px)').matches;
    if (open) {
      lockScroll(true);
      document.documentElement.classList.add('is-locked');
      if (gsap && motion.on) {
        gsap.killTweensOf([root, panel, kids]);
        gsap.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
        gsap.fromTo(panel, mobiel ? { yPercent: 100, y: 0 } : { y: 40, yPercent: 0 }, { yPercent: 0, y: 0, duration: 0.7, ease: 'power3.out' });
        gsap.fromTo(kids, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05, delay: 0.15 });
      }
      requestAnimationFrame(() => panel.querySelector<HTMLElement>('input')?.focus({ preventScroll: true }));
    } else {
      const einde = () => {
        setMounted(false);
        lockScroll(false);
        document.documentElement.classList.remove('is-locked');
        opener.current?.focus?.({ preventScroll: true });
      };
      if (gsap && motion.on) {
        gsap.killTweensOf([root, panel, kids]);
        gsap.to(panel, mobiel ? { yPercent: 100, duration: 0.5, ease: 'power3.in' } : { y: 30, duration: 0.45, ease: 'power3.in' });
        gsap.to(root, { autoAlpha: 0, duration: 0.45, ease: 'power2.in', onComplete: einde });
      } else einde();
    }
  }, [open, mounted]);

  // Esc sluit, Tab blijft binnen de pop-up (focus trap)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const els = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!els.length) return;
      const eerste = els[0];
      const laatste = els[els.length - 1];
      if (e.shiftKey && (document.activeElement === eerste || !panelRef.current.contains(document.activeElement))) {
        e.preventDefault();
        laatste.focus();
      } else if (!e.shiftKey && document.activeElement === laatste) {
        e.preventDefault();
        eerste.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const verstuur = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) || '').trim();
    const datum = v('datum');
    if (datum) {
      const dag = new Date(`${datum}T12:00:00`).getDay();
      const u = uren.find((x) => x.js === dag);
      if (u && !u.tijd) {
        setFout(`Op ${u.dag.toLowerCase()} zijn we gesloten. Kies gerust een andere dag.`);
        return;
      }
    }
    setFout('');
    const leesbaar = datum ? new Intl.DateTimeFormat('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${datum}T12:00:00`)) : '';
    const onderwerp = `Reservatie ${leesbaar} om ${v('uur')} (${v('personen')} pers.)`;
    const lijnen = [
      'Dag,',
      '',
      'Graag reserveer ik een tafel bij ’t Peerdeke.',
      '',
      `Naam: ${v('naam')}`,
      `Telefoon: ${v('telefoon')}`,
      `Datum: ${leesbaar}`,
      `Uur: ${v('uur')}`,
      `Aantal personen: ${v('personen')}`,
      ...(v('opmerking') ? ['', `Opmerking: ${v('opmerking')}`] : []),
      '',
      'Alvast bedankt!',
    ];
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(lijnen.join('\n'))}`;
    setKlaar(true);
  };

  if (!mounted) return null;
  return (
    <div ref={rootRef} className="res" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div ref={panelRef} className="res__p" role="dialog" aria-modal="true" aria-labelledby="res-titel" aria-describedby="res-intro" data-lenis-prevent="">
        <button type="button" className="res__x" aria-label="Sluiten" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </button>
        <div className="res__head">
          <p className="eyebrow" data-in="">
            Reserveren
          </p>
          <h2 id="res-titel" className="t-l" data-in="">
            Reserveer een tafel.
          </h2>
          <p id="res-intro" className="res__intro" data-in="">
            Laat weten wanneer je komt, dan houden we een plekje voor je vrij.
          </p>
        </div>
        <div className="res__body">
          <form className="res__form" onSubmit={verstuur} noValidate={false}>
            <label className="veld" data-in="">
              <span>Naam</span>
              <input name="naam" type="text" autoComplete="name" required />
            </label>
            <label className="veld" data-in="">
              <span>Telefoon</span>
              <input name="telefoon" type="tel" autoComplete="tel" inputMode="tel" required />
            </label>
            <label className="veld" data-in="">
              <span>Datum</span>
              <input name="datum" type="date" min={vandaagIso()} required onChange={() => setFout('')} />
            </label>
            <label className="veld" data-in="">
              <span>Uur</span>
              <input name="uur" type="time" min="09:00" max="21:30" step={900} required />
            </label>
            <label className="veld" data-in="">
              <span>Aantal personen</span>
              <input name="personen" type="number" min={1} max={40} defaultValue={2} inputMode="numeric" required />
            </label>
            <label className="veld veld--vol" data-in="">
              <span>Opmerking</span>
              <textarea name="opmerking" rows={3} placeholder="Kinderstoel, verjaardag, terras ..." />
            </label>
            {fout && (
              <p className="res__fout" role="alert">
                {fout}
              </p>
            )}
            <div className="res__actie" data-in="">
              <button type="submit" className="res__knop">
                Reservatie mailen
              </button>
              <p className="res__nb" aria-live="polite">
                {klaar
                  ? 'Je e-mailprogramma is geopend met je aanvraag. Verstuur de mail om te reserveren; we bevestigen zo snel mogelijk.'
                  : 'Dit opent je e-mailprogramma met je aanvraag al ingevuld.'}
              </p>
            </div>
          </form>
          <aside className="res__aside" data-in="">
            <p className="res__sub">Liever bellen?</p>
            <a href={phoneHref} className="res__tel">
              {phoneDisplay}
            </a>
            <p className="res__sub">Openingsuren</p>
            <ul className="res__uren">
              {uren.map((u) => (
                <li key={u.dag}>
                  <span>{u.dag}</span>
                  <span>{u.tijd ? u.tijd.replace(/:00/g, '') : 'Gesloten'}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
