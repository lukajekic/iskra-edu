import React, { useEffect, useState, useRef } from 'react'; // PROMENJENO: Dodat useRef

const IskraAbout = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // DODATO: State za kontrolu otvaranja modala
  const [isModalOpen, setIsModalOpen] = useState(false);
  // DODATO: useRef za praćenje timeline elemenata za scroll animaciju
  const timelineRefs = useRef([]);

  // Pratimo kursor za suptilni pozadinski glow u Hero sekciji
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // DODATO: IntersectionObserver za Scroll-Driven Masking (Timeline animacija)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('timeline-visible');
          }
        });
      },
      { threshold: 0.6 } // Element mora biti 60% vidljiv da bi se aktivirao
    );

    timelineRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // DODATO: Zatvaranje modala na Escape taster i sprečavanje skrolovanja pozadine
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    // PROMENJENO: Definisane --primary i --primary-rgb na korenskom div-u
    <div 
      className="min-h-screen bg-zinc-950 text-zinc-50 font-sans overflow-hidden"
      style={{ 
        '--primary': '#dc7702',         // Glavna brend boja (možeš menjati u hex po želji)
        '--primary-rgb': '220, 119, 2' // RGB vrednost za rgba() manipulaciju
      }}
    >
      
      {/* --- INLINE CSS ZA CUSTOM ANIMACIJE --- */}
      <style>{`
        /* DODATO: Text Reveal Keyframes */
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-text-reveal {
          animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0;
        }
        .delay-200 { animation-delay: 200ms; }
        
        /* DODATO: Timeline scroll klase */
        .timeline-item {
          opacity: 0.2;
          transform: translateY(20px);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .timeline-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* OSTATAK CSS-a SA --primary VARIJABLOM */
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        
        .bento-card {
          background: rgba(24, 24, 27, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* PROMENJENO: Hover state na bento karticama koristi --primary-rgb */
        .bento-card:hover {
          transform: translateY(-5px) scale(1.01);
          border-color: rgba(var(--primary-rgb), 0.5);
          box-shadow: 0 10px 40px -10px rgba(var(--primary-rgb), 0.2);
        }

        .spark-button:hover .spark {
          animation: fly 0.6s ease-out forwards;
        }
        @keyframes fly {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        
        /* Za tekst selekciju */
        ::selection {
          background: rgba(var(--primary-rgb), 0.3);
        }

        /* DODATO: Smooth ulazne animacije za modal */
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-backdrop {
          animation: modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-modal-content {
          animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* 1. HERO SEKCIJA: Prva Iskra */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* PROMENJENO: Kursor glow prebačen na --primary-rgb */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-all duration-500 ease-out"
          style={{
            background: 'rgba(var(--primary-rgb), 0.15)',
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
        />
        
        <div className="z-10 text-center">
          {/* DODATO: animate-text-reveal za Text Reveal Efekat */}
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-6 animate-text-reveal">
            Sve je počelo od jedne{' '}
            {/* PROMENJENO: Tekst gradijent sada vuče belu do --primary boje */}
            <span 
              className="text-transparent bg-clip-text" 
              style={{ backgroundImage: 'linear-gradient(to right, #ffffff, var(--primary))' }}
            >
              ideje.
            </span>
          </h1>
          {/* DODATO: Delay na podnaslov da bi se pojavio malo nakon naslova */}
          <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light animate-text-reveal delay-200">
            Napravljeno od strane učenika, za učenike. Iskra nije samo softver, to je naš način da transformišemo učenje.
          </p>
        </div>
      </section>

      {/* 2. NAŠA PRIČA: The Timeline */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        {/* PROMENJENO: Tekst Iskra u boji primary */}
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
          Kako se <span style={{ color: 'var(--primary)' }}>Iskra</span> upalila
        </h2>
        
        <div className="relative border-l border-zinc-800 ml-4 md:ml-0">
          {/* DODATO: mapiranje kroz array kako bi lakše primenili refs i timeline-item klase */}
          {[
            { title: 'Početak: Prazan editor', desc: 'Sve je počelo na praznom papiru i sa željom da rešimo stvarne probleme u školi, bez komplikovanih interfejsa.' },
            { title: 'Razvoj: Građenje temelja', desc: 'Povezivanje infrastrukture. Iskra dobija svoju prvu bazu, rute i prepoznatljiv, minimalistički dizajn.' },
            { title: 'Lansiranje: Ulazak u učionice', desc: 'U ovom trenutku, naš najviši cilj jeste upravo da dođemo u tvoju školu. Između novih funkcija i rešavanja tehničkih problema, radimo na tome da upravo što više učenika digitalizuje svoje učenje.' }
          ].map((item, index) => (
            <div 
              key={index}
              ref={el => timelineRefs.current[index] = el}
              className="timeline-item mb-12 ml-8 relative group"
            >
              {/* PROMENJENO: Kružići na timeline-u sada prate --primary */}
              <div 
                className="absolute -left-[41px] top-1 w-5 h-5 bg-zinc-900 border-2 rounded-full transition-colors duration-300"
                style={{ borderColor: 'var(--primary)' }}
              />
              <h3 className="text-xl font-semibold text-zinc-100">{item.title}</h3>
              <p className="mt-2 text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BENTO GRID: Naše vrednosti */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Šta nas izdvaja</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kartica 1 (Šira) */}
          <div className="bento-card col-span-1 md:col-span-2 rounded-3xl p-8 flex flex-col justify-end min-h-[300px] relative overflow-hidden group">
            {/* PROMENJENO: Gradijent u pozadini Bento grid kartica sada koristi --primary-rgb */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ background: 'linear-gradient(to bottom right, rgba(var(--primary-rgb), 0.1), transparent)' }}
            />
            <h3 className="text-2xl font-bold z-10">Minimalizam na delu</h3>
            <p className="text-zinc-400 mt-2 z-10">Manje klikova, više fokusa. Čist interfejs bez skrivenih komplikacija koji poštuje tvoje vreme.</p>
          </div>
          
          {/* Kartica 2 */}
          <div className="bento-card col-span-1 rounded-3xl p-8 flex flex-col justify-end min-h-[300px] relative overflow-hidden group">
             <div 
               className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
               style={{ background: 'linear-gradient(to bottom right, rgba(var(--primary-rgb), 0.1), transparent)' }}
             />
            <h3 className="text-2xl font-bold z-10">Peer-to-Peer moć</h3>
            <p className="text-zinc-400 mt-2 z-10">Od vršnjaka za vršnjake. Najbolje znamo šta nam učenje čini lakšim.</p>
          </div>

          {/* Kartica 3 */}
          <div className="bento-card col-span-1 rounded-3xl p-8 flex flex-col justify-end min-h-[300px] relative overflow-hidden group">
             <div 
               className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
               style={{ background: 'linear-gradient(to bottom right, rgba(var(--primary-rgb), 0.1), transparent)' }}
             />
            <h3 className="text-2xl font-bold z-10">Iskra leti</h3>
            <p className="text-zinc-400 mt-2 z-10">Optimizovan kod koji ne troši vreme. Performanse su nam na prvom mestu.</p>
          </div>

          {/* Kartica 4 (Šira) */}
          <div className="bento-card col-span-1 md:col-span-2 rounded-3xl p-8 flex flex-col justify-end min-h-[300px] relative overflow-hidden group">
             <div 
               className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
               style={{ background: 'linear-gradient(to bottom right, rgba(var(--primary-rgb), 0.1), transparent)' }}
             />
            <h3 className="text-2xl font-bold z-10">Zajednica i kod</h3>
            <p className="text-zinc-400 mt-2 z-10">Otvoreni za inovacije. Spajamo tehnologiju i svakodnevno obrazovanje na pravi način, slušajući feedback korisnika.</p>
          </div>
        </div>
      </section>

      {/* 4. TECH STACK: Infinite Marquee */}
      <section className="py-20 border-y border-zinc-800/50 bg-zinc-900/20 overflow-hidden">
        <div className="flex animate-marquee gap-16 pr-16 items-center">
          {/* Dupliramo listu tehnologija za seamless loop efekat */}
          {[1, 2].map((loop) => (
            <React.Fragment key={loop}>
              {/* PROMENJENO: Hover tekst na tehnologijama vuče primary boju umesto default brand boja (npr. react blue) po tvojoj želji za apsolutnim brendingom */}
              <span className="text-4xl font-bold text-zinc-600 transition-colors duration-300 cursor-default hover:text-[var(--primary)]">React</span>
              <span className="text-4xl font-bold text-zinc-600 transition-colors duration-300 cursor-default hover:text-[var(--primary)]">Node.js</span>
              <span className="text-4xl font-bold text-zinc-600 transition-colors duration-300 cursor-default hover:text-[var(--primary)]">Express</span>
              <span className="text-4xl font-bold text-zinc-600 transition-colors duration-300 cursor-default hover:text-[var(--primary)]">MongoDB</span>
              <span className="text-4xl font-bold text-zinc-600 transition-colors duration-300 cursor-default hover:text-[var(--primary)]">Tailwind</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 5. CTA SEKCIJA: Footer poziv na akciju */}
      <section className="py-32 px-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Želiš da tvoja iskra pokrene <span className="italic" style={{ color: 'var(--primary)' }}>nešto novo?</span>
        </h2>
        <p className="text-zinc-400 max-w-xl mb-12 text-lg">
          Bilo da imaš ideju za novu funkciju, želiš da doprineseš platformi ili jednostavno želiš Iskru u svom odeljenju — vrata su otvorena.
        </p>
        
        {/* Spark Button */}
        {/* PROMENJENO: Dodat onClick event koji otvara modal */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="spark-button relative px-8 py-4 bg-zinc-100 text-zinc-900 font-bold rounded-full overflow-visible transition-transform hover:scale-105 active:scale-95"
        >
          Započni priču
          {/* PROMENJENO: Particle efekti (iskrice) sada takođe koriste var(--primary) ali u različitim opacitetima/tonovima da bi bilo dinamično */}
          <span className="spark absolute w-1.5 h-1.5 rounded-full left-1/2 top-1/2" style={{ background: 'var(--primary)', '--tx': '30px', '--ty': '-40px' }}></span>
          <span className="spark absolute w-2 h-2 rounded-full left-1/2 top-1/2" style={{ background: 'rgba(var(--primary-rgb), 0.7)', '--tx': '-40px', '--ty': '-30px' }}></span>
          <span className="spark absolute w-1 h-1 rounded-full left-1/2 top-1/2" style={{ background: 'rgba(var(--primary-rgb), 0.4)', '--tx': '40px', '--ty': '20px' }}></span>
          <span className="spark absolute w-1.5 h-1.5 rounded-full left-1/2 top-1/2" style={{ background: 'var(--primary)', '--tx': '-25px', '--ty': '35px' }}></span>
        </button>
      </section>

      {/* --- DODATO: MODAL SA LINKOVIMA I MOTIVACIONOM PORUKOM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden animate-modal-backdrop bg-black/60 backdrop-blur-md">
          {/* Klik na zatamnjenu pozadinu zatvara modal */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-2xl overflow-hidden bento-card rounded-3xl p-8 md:p-10 animate-modal-content max-h-[90vh] overflow-y-auto">
            {/* Ambijentalni glow unutar samog modala */}
            <div 
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[80px] pointer-events-none"
              style={{ background: 'rgba(var(--primary-rgb), 0.15)' }}
            />
            
            {/* Dugme za zatvaranje modala (X) */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
              aria-label="Zatvori"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Sadržaj modala */}
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                <span style={{ color: 'var(--primary)' }}>Hej,</span> 
              </h3>
              
              <p className="text-zinc-400 font-light leading-relaxed mb-8 text-base md:text-lg">
                Za svakoga ko želi da započne svoj put u programiranju ili malo upotpuni znanje time što će isprobati, testirati i menjati kod Iskre – <span className="text-zinc-200 font-medium">vrata su uvek otvorena</span>. Nema glupih pitanja, samo dobrih projekata. Javi se da učimo zajedno!
              </p>

              {/* Grid sa kontakt karticama */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com/in/luka-jeki%C4%87-5bab8a278/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bento-card group/card p-5 rounded-2xl flex flex-col justify-between min-h-[130px] hover:-translate-y-1"
                >
                  <div className="text-zinc-400 group-hover/card:text-[var(--primary)] transition-colors">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-100 text-sm">LinkedIn</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Povežimo se</p>
                  </div>
                </a>

                {/* GitHub */}
                <a 
                  href="https://github.com/lukajekic" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bento-card group/card p-5 rounded-2xl flex flex-col justify-between min-h-[130px] hover:-translate-y-1"
                >
                  <div className="text-zinc-400 group-hover/card:text-[var(--primary)] transition-colors">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-100 text-sm">GitHub</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Pogledaj izvorni kod i ostale projekte</p>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:lukajekic913@gmail.com" 
                  className="bento-card group/card p-5 rounded-2xl flex flex-col justify-between min-h-[130px] hover:-translate-y-1"
                >
                  <div className="text-zinc-400 group-hover/card:text-[var(--primary)] transition-colors">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-100 text-sm">Piši mi</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">lukajekic913@gmail.com</p>
                  </div>
                </a>

              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default IskraAbout;