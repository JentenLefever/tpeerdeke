import { useEffect, useState, type ReactNode } from 'react';

const contact = {
  phoneDisplay: '056 60 44 64',
  phoneHref: 'tel:+3256604464',
  email: 'vd.steve@hotmail.be',
  street: 'Pand 255-257',
  city: '8790 Waregem',
};

// Bron: hetpandwaregem.be/winkels-en-bedrijven/t-peerdeke/
// index = Date.getDay() (0 = zondag)
const uren: { dag: string; kort: string; tijd: string | null; js: number }[] = [
  { dag: 'Maandag', kort: 'ma', tijd: '09:00 – 21:00', js: 1 },
  { dag: 'Dinsdag', kort: 'di', tijd: null, js: 2 },
  { dag: 'Woensdag', kort: 'wo', tijd: '09:00 – 21:00', js: 3 },
  { dag: 'Donderdag', kort: 'do', tijd: '09:00 – 21:00', js: 4 },
  { dag: 'Vrijdag', kort: 'vr', tijd: '09:00 – 22:00', js: 5 },
  { dag: 'Zaterdag', kort: 'za', tijd: '09:00 – 21:00', js: 6 },
  { dag: 'Zondag', kort: 'zo', tijd: '10:00 – 20:00', js: 0 },
];

function brusselsDag(): number {
  const naam = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Brussels' }).format(new Date());
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(naam);
}

function useVandaag() {
  const [dag, setDag] = useState<number | null>(null);
  useEffect(() => setDag(brusselsDag()), []);
  return dag;
}

function Foto({ label, variant = '', className = '' }: { label: string; variant?: '' | 'donker' | 'licht'; className?: string }) {
  return (
    <figure className={`foto grain ${variant ? `foto--${variant}` : ''} ${className}`} aria-label={`Plaatshouder: ${label}`}>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function Header() {
  const links = [
    ['Over ons', '#over'],
    ['Aanbod', '#aanbod'],
    ['Uren', '#uren'],
    ['Locatie', '#locatie'],
    ['Contact', '#contact'],
  ];
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <a href="#top" className="font-serif text-xl font-bold tracking-tight text-bruin">
          ’t Peerdeke
        </a>
        <nav className="hidden gap-8 text-sm text-bruin-licht md:flex" aria-label="Hoofdmenu">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="transition-colors hover:text-goud">
              {l}
            </a>
          ))}
        </nav>
        <a href={contact.phoneHref} className="text-sm font-semibold text-bruin underline decoration-goud decoration-2 underline-offset-4 md:hidden">
          Bel ons
        </a>
      </div>
    </header>
  );
}

function Hero({ vandaag }: { vandaag: number | null }) {
  const vandaagUren = vandaag === null ? null : uren.find((u) => u.js === vandaag);
  return (
    <section id="top" className="grain relative overflow-hidden bg-creme pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-7 md:pt-10">
          <p className="kicker">Taverne · Het Pand · Waregem</p>
          <h1 className="mt-6 font-serif text-[2.9rem] leading-[1.02] font-medium tracking-tight text-bruin md:text-[5.2rem]">
            Een koffie,
            <br />
            een pintje,
            <br />
            <em className="font-serif text-goud not-italic md:italic">iets om te eten.</em>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-bruin-licht">
            Taverne ’t Peerdeke ligt midden in Het Pand in Waregem. Met een terras, en vlot toegankelijk voor iedereen.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
            <a href={contact.phoneHref} className="bg-bruin px-6 py-3.5 font-semibold tracking-wide text-creme transition-colors hover:bg-goud">
              {contact.phoneDisplay}
            </a>
            {vandaagUren && (
              <p className="text-bruin-licht">
                <span className="kicker mr-3 text-goud">Vandaag</span>
                {vandaagUren.tijd ?? 'gesloten'}
              </p>
            )}
          </div>
        </div>
        <div className="relative md:col-span-5">
          <Foto label="[Foto gevel of terras]" className="aspect-[4/5] w-full md:mt-16" />
          <Foto label="[Foto detail: pintje]" variant="licht" className="absolute -bottom-10 -left-8 hidden aspect-square w-40 shadow-xl md:block" />
        </div>
      </div>
    </section>
  );
}

function SectieKop({ nr, kicker, titel }: { nr: string; kicker: string; titel: ReactNode }) {
  return (
    <div className="flex items-baseline gap-5">
      <span className="font-serif text-sm text-goud">{nr}</span>
      <div>
        <p className="kicker">{kicker}</p>
        <h2 className="mt-3 font-serif text-4xl leading-tight font-medium tracking-tight md:text-5xl">{titel}</h2>
      </div>
    </div>
  );
}

function Over() {
  return (
    <section id="over" className="bg-creme py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5 md:col-start-1">
          <Foto label="[Foto interieur]" variant="donker" className="aspect-[3/4] w-full" />
        </div>
        <div className="md:col-span-6 md:col-start-7 md:pt-20">
          <SectieKop nr="01" kicker="Over ons" titel={<>Een taverne zoals het hoort.</>} />
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-bruin-licht">
            <p>
              Even op adem komen tussen het winkelen door, afspreken met vrienden of rustig de krant lezen bij een koffie. ’t Peerdeke is er voor
              iedereen die in Het Pand passeert.
            </p>
            <p>
              <span className="placeholder-text">[Eigen verhaal: wie staat achter de toog, sinds wanneer]</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Aanbod() {
  const items = [
    { titel: 'Koffie', tekst: 'Voor de start van de dag of als pauze tussen twee winkels door.' },
    { titel: 'Van ’t vat', tekst: 'Een vers getapt pintje, binnen of op het terras.' },
    { titel: 'Honger?', tekst: 'Bestel iets om je honger te stillen.' },
  ];
  return (
    <section id="aanbod" className="grain relative bg-zand py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectieKop nr="02" kicker="Aanbod" titel={<>Wat mag het zijn?</>} />
          </div>
          <p className="max-w-md text-lg leading-relaxed text-bruin-licht md:col-span-5 md:col-start-8 md:pt-10">
            Van de eerste koffie om 9 uur tot het laatste pintje ’s avonds.
          </p>
        </div>

        <div className="mt-16 border-t border-bruin/20">
          {items.map((it, i) => (
            <div key={it.titel} className="grid gap-3 border-b border-bruin/20 py-8 md:grid-cols-12 md:items-baseline">
              <span className="font-serif text-sm text-goud md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-serif text-3xl font-medium md:col-span-4 md:text-4xl">{it.titel}</h3>
              <p className="text-bruin-licht md:col-span-6 md:col-start-7">{it.tekst}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-2 border-dashed border-goud/60 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="kicker">Menukaart</p>
            <p className="mt-2 font-serif text-2xl">
              <span className="placeholder-text">[Menukaart]</span>
            </p>
            <p className="mt-2 text-sm text-bruin-licht">Plaatshouder: gerechten, dranken en prijzen aan te leveren door ’t Peerdeke.</p>
          </div>
          <a href={contact.phoneHref} className="self-start text-sm font-semibold underline decoration-goud decoration-2 underline-offset-4 md:self-auto">
            Vragen? Bel {contact.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}

function Troeven() {
  const troeven = [
    { titel: 'Terras', tekst: 'Bij goed weer zit je buiten, midden in de drukte van Het Pand.' },
    { titel: 'Rolstoeltoegankelijk', tekst: 'Iedereen is welkom en komt vlot binnen.' },
    { titel: 'In Het Pand', tekst: 'Winkelen, iets drinken en iets eten: allemaal op één plek.' },
  ];
  return (
    <section className="bg-creme py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-6">
          <SectieKop nr="03" kicker="Troeven" titel={<>Waarom bij ons?</>} />
          <ul className="mt-12 space-y-10">
            {troeven.map((t) => (
              <li key={t.titel} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span aria-hidden className="mt-3 h-px w-8 bg-goud" />
                <div>
                  <h3 className="font-serif text-2xl font-medium md:text-3xl">{t.titel}</h3>
                  <p className="mt-2 text-bruin-licht">{t.tekst}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-5 gap-4 md:col-span-5 md:col-start-8">
          <Foto label="[Foto terras]" className="col-span-5 aspect-[4/3]" />
          <Foto label="[Foto toog]" variant="donker" className="col-span-3 aspect-square" />
          <Foto label="[Foto Het Pand]" variant="licht" className="col-span-2 mt-10 aspect-[3/4]" />
        </div>
      </div>
    </section>
  );
}

function Uren({ vandaag }: { vandaag: number | null }) {
  return (
    <section id="uren" className="grain relative bg-bruin py-24 text-creme md:py-32">
      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <div className="flex items-baseline gap-5">
            <span className="font-serif text-sm text-goud-licht">04</span>
            <div>
              <p className="kicker text-goud-licht">Openingsuren</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight font-medium md:text-5xl">Wanneer ben je welkom?</h2>
              <p className="mt-6 text-creme/70">Op dinsdag is ’t Peerdeke gesloten.</p>
            </div>
          </div>
        </div>
        <dl className="md:col-span-7 md:col-start-6">
          {uren.map((u) => {
            const isVandaag = u.js === vandaag;
            return (
              <div key={u.dag} className={`flex items-baseline gap-4 border-b border-creme/15 py-4 ${isVandaag ? 'text-goud-licht' : ''}`}>
                <dt className="font-serif text-xl md:text-2xl">
                  {u.dag}
                  {isVandaag && <span className="ml-3 align-middle font-sans text-[0.65rem] tracking-[0.2em] uppercase">vandaag</span>}
                </dt>
                <span aria-hidden className="flex-1 translate-y-[-4px] border-b border-dotted border-creme/30" />
                <dd className={`tabular-nums ${u.tijd ? '' : 'italic text-creme/50'}`}>{u.tijd ?? 'gesloten'}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

function Locatie() {
  return (
    <section id="locatie" className="bg-creme py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <SectieKop nr="05" kicker="Locatie" titel={<>Je vindt ons in Het Pand.</>} />
          <address className="mt-8 text-lg leading-relaxed not-italic text-bruin-licht">
            {contact.street}
            <br />
            {contact.city}
          </address>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Pand+255,+8790+Waregem"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm font-semibold underline decoration-goud decoration-2 underline-offset-4"
          >
            Route plannen
          </a>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <div className="overflow-hidden border border-bruin/15 bg-zand p-2">
            <iframe
              title="Kaart: Pand 255, 8790 Waregem"
              src="https://www.google.com/maps?q=Pand+255,+8790+Waregem&output=embed"
              className="block h-[360px] w-full md:h-[440px]"
              style={{ filter: 'sepia(.25) saturate(.85)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="grain relative bg-zand py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <SectieKop nr="06" kicker="Contact" titel={<>Even bellen of mailen?</>} />
        <div className="mt-14 grid gap-10 md:grid-cols-12">
          <a href={contact.phoneHref} className="group md:col-span-6">
            <p className="kicker">Telefoon</p>
            <p className="mt-3 font-serif text-4xl font-medium transition-colors group-hover:text-goud md:text-6xl">{contact.phoneDisplay}</p>
          </a>
          <div className="space-y-8 md:col-span-5 md:col-start-8 md:pt-2">
            <div>
              <p className="kicker">E-mail</p>
              <a href={`mailto:${contact.email}`} className="mt-2 block text-lg underline decoration-goud/60 underline-offset-4 hover:text-goud">
                {contact.email}
              </a>
            </div>
            <div>
              <p className="kicker">Adres</p>
              <p className="mt-2 text-lg">
                {contact.street}, {contact.city}
              </p>
            </div>
            <div>
              <p className="kicker">Sociale media</p>
              <p className="mt-2">
                <span className="placeholder-text">[Facebook / Instagram]</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-bruin text-creme/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 text-sm md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <p className="font-serif text-2xl text-creme">’t Peerdeke</p>
          <p className="mt-2">
            Taverne in Het Pand · {contact.street}, {contact.city}
          </p>
        </div>
        <p>
          © {new Date().getFullYear()} ’t Peerdeke · <span className="placeholder-text !text-creme/80 !bg-creme/10">[Ondernemingsnummer]</span>
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  const vandaag = useVandaag();
  return (
    <>
      <Header />
      <main>
        <Hero vandaag={vandaag} />
        <Over />
        <Aanbod />
        <Troeven />
        <Uren vandaag={vandaag} />
        <Locatie />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
