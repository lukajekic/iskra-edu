import ReactMarkdown from 'react-markdown';

const termsContent = `

# Politika privatnosti

## 1. Rukovalac podataka

Rukovalac podacima o ličnosti obrađenim u okviru Platforme Iskra je Luka Jekić, autor i administrator Platforme ("mi", "Iskra"). U pojedinim slučajevima (npr. Izveštaj za roditelje, opisano u odeljku 8) Institucija/nastavnik može biti samostalni rukovalac, a Iskra postupa kao njihov obrađivač — detalji su dati u posebnom obaveštenju o saglasnosti za tu funkciju.

Za sva pitanja u vezi sa obradom podataka o ličnosti možete nam se obratiti na **lukajekic913@gmail.com**. Za tehnička pitanja i podršku koristite **podrska@iskraedu.zohodesk.eu** (podrška se pruža putem sistema Zoho Desk — videti odeljak 11).

## 2. Koje podatke prikupljamo

Platforma Iskra prikuplja minimalnu količinu podataka potrebnu za funkcionisanje usluge.

**Od učenika sa trajnim nalogom:**
- ime i prezime;
- automatski generisano korisničko ime;
- lozinku (u enkriptovanom obliku, videti odeljak 6);
- rešenja urađenih zadataka: tačnost rešenja, sistemske greške/preporuke, jedinstveni ID rešenja, sadržaj rešenja u izvornom obliku, referencu na nastavnika;
- podatke o polaganju ispita/testova: predate odgovore, ostvarene poene, ocenu, povratnu informaciju nastavnika, datume početka i predaje.

**Od učenika sa privremenim nalogom** (prijava pristupnim kodom nastavne grupe):
- ime i prezime;
- pristupni kod i referencu na nastavnika;
- vreme isteka naloga;
- rešenja i podatke o ispitima/testovima (kao gore).

**Od nastavnika:**
- ime i prezime, korisničko ime, lozinku;
- naziv institucije u kojoj predaje;
- podatke o aktivnoj nastavnoj grupi (kod grupe, ID grupe, rok važenja), ukoliko postoji.

**Tehnički podaci** koji se prikupljaju automatski prilikom korišćenja Platforme (kolačići, adresa i vreme pristupa, tip uređaja) opisani su posebno u odeljku 9 (Kolačići) i odeljku 10 (Analitika).

## 3. Obrada podataka — IskraAI Mentor

Unutar Platforme integrisan je AI asistent koji učenicima pruža pedagoške smernice prilikom rešavanja zadataka. Kako bismo zaštitili privatnost korisnika, sistem funkcioniše po sledećim principima:

- **Anonimizacija:** Kada učenik zatraži pomoć, sistemu koji generiše odgovor prosleđuju se isključivo tekst zadatka i kôd koji je učenik napisao. Nijedan lični podatak (ime, prezime, korisničko ime, ID naloga) se ne šalje eksternom modelu.
- **Model i infrastruktura:** Odgovore trenutno generiše jezički model **Llama 3 (8B Instruct)**, koji se izvršava putem infrastrukture **Cloudflare Workers AI**. Autor zadržava pravo da promeni model ili dobavljača infrastrukture; u tom slučaju će ovaj odeljak biti ažuriran.
- **Skladištenje radi unapređenja Platforme:** Radi razvoja sopstvenih edukativnih modela i unapređenja kvaliteta sugestija na srpskom jeziku, trajno čuvamo parove: tekst zadatka, netačan kôd učenika i generisanu AI sugestiju, zajedno sa metapodacima (jezik, model, vreme). Ovi zapisi **ne sadrže identifikator učenika niti nastavnika** i tehnički se ne mogu povezati sa konkretnim korisnikom, zbog čega ih ne možemo pojedinačno pronaći ili obrisati na zahtev jednog korisnika — možete zatražiti da vaš budući kôd ne bude obuhvaćen ovim skladištenjem obraćanjem na kontakt iz odeljka 1.

## 4. Obrada podataka — Iskra Planner i Iskra Canvas

Iskra Planner (generisanje predloga planova nastave) i Iskra Canvas (generisanje vizuelnih mapa/dijagrama) koriste jezički model **openai/gpt-oss-120b**, koji se izvršava putem infrastrukture kompanije **Groq**.

- Modelu se šalju isključivo podaci potrebni za generisanje sadržaja: predmet, razred, vrsta škole, tema/naslov plana ili lekcije i, gde je primenjivo, prethodno sačuvani sadržaj plana koji nastavnik uređuje. Lični podaci učenika se ne šalju.
- Groq može, u skladu sa svojom politikom privatnosti, kratkotrajno obrađivati poslate podatke radi pružanja usluge. Iskra ne kontroliše interne rokove čuvanja podataka kod Groq-a — videti link na njihovu politiku privatnosti u odeljku 11.
- Korišćenje ovih alata je ograničeno dnevnim/kreditnim limitom po nalogu nastavnika, koji se čuva radi sprečavanja zloupotrebe i praćenja potrošnje resursa.

## 5. Zaštita lozinke

Iskra svim korisnicima omogućava zaštitu naloga — svaka lozinka se enkriptuje metodom heširanja sa "salt" vrednošću (bcrypt), tako da se lozinka ne može dekriptovati, već se samo proverava podudarnost sa unetom lozinkom prilikom prijave. Nijedan administrator Iskre ne može videti originalnu lozinku korisnika.

Učenici prijavljeni pristupnim kodom nastavne grupe (privremeni nalozi) nemaju podrazumevanu enkripciju lozinke identičnu trajnim nalozima, ali poseduju dodatni stepen zaštite — na njihovu sesiju ne može se ponovo pristupiti sa istog ili drugog uređaja nakon odjave ili isteka sesije.

## 6. Pravni osnov obrade

Podatke obrađujemo po sledećim pravnim osnovima, u skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije i (gde je primenjivo) Opštom uredbom o zaštiti podataka (GDPR):

- **Izvršenje ugovora/pružanje usluge** — za osnovne podatke o nalogu, rešenja zadataka i ispite, jer su neophodni za funkcionisanje Platforme koju je Institucija/nastavnik odabrala za nastavu.
- **Legitimni interes** — za bezbednosne mere (sprečavanje zloupotrebe, rate limiting), osnovnu analitiku korišćenja i unapređenje IskraAI modela na anonimizovanim podacima.
- **Izričita saglasnost** — za pristup Izveštaju za roditelje (odeljak 8) i, gde je primenjivo, za analitičke kolačiće koji nisu strogo neophodni (odeljak 9).

Za maloletne korisnike, pravni osnov za samo uključivanje u korišćenje Platforme obezbeđuje Institucija/nastavnik u skladu sa odeljkom 2.1 Uslova upotrebe.

## 7. Rok čuvanja podataka

- Podaci privremenih naloga brišu se automatski po isteku nastavne grupe, prevremenom prekidu njenog važenja ili kreiranjem nove grupe od strane istog nastavnika.
- Podaci trajnih naloga čuvaju se dok nalog nije obrisan na zahtev korisnika, nastavnika/Institucije ili Autora, ili dok se opravdano ne proceni da su podaci prestali da služe svrsi (npr. dugotrajno neaktivan nalog).
- Anonimizovani zapisi IskraAI Mentora (odeljak 3) čuvaju se neograničeno, jer ne predstavljaju lične podatke.
- Evidencioni trag o saglasnosti za Izveštaj za roditelje čuva se u skladu sa posebnim obaveštenjem o saglasnosti (odeljak 8).

## 8. Izveštaj za roditelje

Roditelji/staratelji mogu, unosom korisničkog imena i lozinke učeničkog naloga i potvrdom posebne saglasnosti, dobiti uvid u napredak deteta. Ova funkcija ima **poseban, detaljan tekst saglasnosti** (rukovalac, svrha, pravni osnov, prava lica, bezbednosna napomena) koji se prikazuje pre svakog pristupa izveštaju i predstavlja sastavni deo ove Politike privatnosti. Izveštaj se ne čuva na serveru nakon prikazivanja — generiše se u trenutku zahteva.

## 9. Kolačići (Cookies)

Platforma koristi sledeće kolačiće i slične tehnologije:

- **\`token\`** — strogo neophodan (funkcionalan) HTTP-only kolačić koji održava vašu prijavljenu sesiju. Bez njega Platforma ne može da funkcioniše. Ne zahteva saglasnost jer je neophodan za pružanje usluge.
- **\`sidebar_state\`** — funkcionalan kolačić koji pamti da li je bočni meni proširen ili skupljen, radi boljeg korisničkog iskustva.
- **Kolačići/localStorage alata za analitiku** (PostHog, Metrica) — koriste se za praćenje anonimizovanog ponašanja na Platformi, opisano detaljnije u odeljku 10. Gde je tehnički moguće, ovi podaci se ne povezuju sa identitetom korisnika bez izričite prijave (login) korisnika.

Onemogućavanjem kolačića u podešavanjima pregledača možete uticati na funkcionalnost Platforme, uključujući mogućnost prijave.

## 10. Analitika

Iskra periodično prati ponašanje korisnika na Platformi i deli određene podatke sa sledećim partnerima:

- **Metrica** — prati tačnost zadataka, učestalost kreiranja grupa, prijava/odjava, registracija, kreiranja zadataka, sakrivanja/otkrivanja foldera i slična ponašanja, bez direktnog povezivanja sa identitetom korisnika (prati se vreme radnje i država iz koje je radnja izvršena).
- **ipapi.co** — dostavlja Metrici podatak o zemlji porekla na osnovu IP adrese.
- **Vercel Analytics** — prikuplja osnovnu, agregiranu statistiku posete Platformi.
- **PostHog** — prikuplja podatke o korišćenju Platforme (klikovi, navigacija, greške) radi unapređenja proizvoda; pri prijavljenom korisniku može identifikovati nalog (ime, korisničko ime, tip naloga) radi analize po tipu korisnika.

## 11. Deljenje podataka sa trećim licima

Podaci se dele sa sledećim trećim licima, isključivo u meri neophodnoj za funkcionisanje Platforme:

1. **MongoDB Atlas** — skladištenje svih podataka u bazi, uključujući enkriptovanu lozinku.
2. **Render, Railway i Hugging Face** — hostovanje i održavanje servera; nemaju trajan pristup podacima, ali mogu imati kratkotrajan uvid u protok podataka tokom komunikacije.
3. **Hugging Face Spaces** — kontejner za izvršavanje/proveru Python koda; može imati kratkotrajan uvid u poslati kôd, bez uvida u ostale podatke.
4. **Google Firebase** — komunicira sa klijentskom aplikacijom radi prikazivanja statusa rada (Remote Config) i odgovarajućeg korisničkog iskustva.
5. **Cloudflare Workers AI** — izvršava jezički model za IskraAI Mentor (odeljak 3).
6. **Groq** — izvršava jezički model za Iskra Planner i Iskra Canvas (odeljak 4).
7. **Zoho Desk** — sistem za tehničku podršku; podaci koje pošaljete putem tikceta za podršku (npr. e-mail, opis problema, snimak ekrana) obrađuju se u okviru ovog sistema.
8. **PostHog, Metrica, ipapi.co, Vercel Analytics** — analitički partneri, opisano u odeljku 10.

## 12. Prenos podataka van Republike Srbije

Pojedini navedeni pružaoci usluga (npr. MongoDB Atlas, Render, Groq, Cloudflare, Vercel, Google Firebase) mogu obrađivati podatke na serverima izvan Republike Srbije, uključujući zemlje van Evropske unije. Takav prenos se oslanja na mehanizme zaštite koje ti pružaoci usluga navode u svojim politikama privatnosti (npr. standardne ugovorne klauzule ili ekvivalentne garancije). Iskra bira pružaoce usluga koji javno objavljuju svoje standarde zaštite podataka, ali ne može garantovati primenu propisa Republike Srbije od strane trećih lica van njene kontrole.

## 13. Ovlašćenja u uvid podataka

Podatke o učenicima mogu videti: nastavnik koji predaje tom učeniku (u okviru svoje nastavne grupe), roditelj/staratelj (uz saglasnost, odeljak 8) i lica koja aktivno rade na razvoju i održavanju Platforme, u meri neophodnoj za rad sistema i rešavanje tehničkih problema.

## 14. Prava korisnika

U skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije, u vezi sa podacima koje obrađujemo kao rukovalac imate pravo da:

- zatražite **pristup** podacima koje čuvamo o vama;
- zatražite **ispravku** netačnih ili nepotpunih podataka;
- zatražite **brisanje** podataka (osim kada zadržavanje proizlazi iz zakonske obaveze ili prevladavajućeg legitimnog interesa, npr. anonimizovani AI zapisi iz odeljka 3);
- **opozovete saglasnost** u svakom trenutku, bez uticaja na zakonitost obrade izvršene pre opoziva (npr. saglasnost za Izveštaj za roditelje);
- **uložite prigovor** na obradu zasnovanu na legitimnom interesu;
- podnesete **pritužbu Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti** Republike Srbije (www.poverenik.rs), ukoliko smatrate da je obrada nezakonita.

Zahteve možete uputiti na kontakt iz odeljka 1. Odgovaramo u razumnom roku, u skladu sa važećim propisima.

## 15. Bezbednosne mere

Primenjujemo razumne tehničke i organizacione mere zaštite: enkripciju lozinki (bcrypt), autentikaciju putem HTTP-only kolačića, ograničenje broja zahteva (rate limiting) radi sprečavanja zloupotrebe i automatizovanih napada, kao i ograničen pristup podacima samo licima kojima je to neophodno za rad Platforme. I pored preduzetih mera, nijedan sistem prenosa ili čuvanja podataka nije apsolutno bezbedan; u slučaju bezbednosnog incidenta koji utiče na vaše podatke, obavestićemo pogođene korisnike i nadležne organe u skladu sa važećim propisima.

## 16. Podaci maloletnih lica

Znatan deo korisnika Platforme su maloletna lica (učenici). Iskra ne prikuplja podatke direktno od dece van konteksta organizovane nastave — pristup nalogu učenika omogućava Institucija/nastavnik, koji je odgovoran za postojanje odgovarajućeg pravnog osnova prema roditeljima/starateljima (videti odeljak 2.1 Uslova upotrebe). Roditeljima/starateljima stavljamo na raspolaganje poseban uvid u podatke deteta putem funkcije opisane u odeljku 8.

## 17. Politike privatnosti trećih lica

- **MongoDB Atlas** — https://www.mongodb.com/legal/privacy/privacy-policy
- **Render** — https://render.com/privacy
- **Railway** — https://railway.com/legal/privacy
- **Hugging Face** — https://huggingface.co/privacy
- **Google Firebase (Google Cloud)** — https://firebase.google.com/support/privacy
- **Vercel Analytics** — https://vercel.com/docs/analytics/privacy-policy
- **Cloudflare** — https://www.cloudflare.com/privacypolicy
- **Cloudflare Workers AI Data Usage** — https://developers.cloudflare.com/workers-ai/platform/data-usage
- **Groq** — https://groq.com/privacy-policy
- **PostHog** — https://posthog.com/privacy
- **Zoho Desk** — https://www.zoho.com/privacy.html
- **ipapi.co** — https://ipapi.co/privacy/

## 18. Izmene politike

Ova Politika može biti izmenjena radi usklađivanja sa promenama na Platformi ili važećim propisima. O bitnijim izmenama korisnici će po mogućnosti biti obavešteni putem vidljive napomene na Platformi ili ažuriranjem datuma poslednje izmene. Preporučuje se periodična poseta ovoj stranici. Iskra nije odgovorna za promene politika privatnosti trećih lica navedenih u odeljku 17, niti za njihovu dostupnost.

## 19. Kontakt

Za sva pitanja o ovoj Politici privatnosti ili ostvarivanju vaših prava, pišite na **lukajekic913@gmail.com**. Za tehničku podršku koristite **podrska@iskraedu.zohodesk.eu**.

Korišćenje Iskra edukativnog sistema podrazumeva prihvatanje ove Politike privatnosti i Uslova upotrebe.

**Hvala Vam što koristite Iskra edukativni sistem.**

Poslednja izmena: 23. avgust 2026.
`;

function Privacy() {
  return (
    <div className="md-wrapper">
      <div className='markdown-container' >
      <ReactMarkdown >
        {termsContent}
      </ReactMarkdown>
    </div>
    </div>
  );
}

export default Privacy