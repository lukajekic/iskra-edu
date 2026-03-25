import ReactMarkdown from 'react-markdown';

const termsContent = `
# Politika privatnosti
## Prikupljanje podataka
Platforma Iskra osmišljena je da prikuplja minimalnu količinu podataka svojih korisnika, dovojlno za funkcionisanje platforme po standardima kvaliteta.

Iskra od učenika prikuplja sledeće podatke

 - Ime i prezime
 - Automatski generisano korisničko ime
 - Lozinku (bezbednost lozinke, u daljem tekstu)
 - Rešenja urađenih zadataka koja podrazumevaju sledeće:
	  - Tačnost rešenja
	  - Sistemske greške ili preporuke
	  - Jeidnstveni ID rešenja
	  - Napisano rešenje u izvornom obliku
- Referenca na ID profesora koji predaje učeniku

Iskra takođe omogućava kreiranje privremenih naloga, samim time prikupljaju se sledeći podaci:

 - Ime i prezime
 - Pristupni kod
 - Referenca na ID profesora
 - Istek perioda upotrebe naloga
 - Rešenja i njihovi podaci (navedeno ranije)

Za korisničke naloge profesora prikupljaju se sledeći podaci:

 - Ime i prezime
 - Korisničko ime
 - Lozinka
 - Institucija u kojoj profesor predaje (naziv)
 - Posedovanje aktivne nastavne grupe, ukoliko je podatak potvrdan, sledeći se podaci prikupljaju:
	 - Istek perioda važenja nastavne grupe
	 - Kod nastavne grupe
	 - ID nastavne grupe

## Zaštita lozinke
iskra svim svojim korisnicima omogućava zaštitu svojih naloga, svaka lozinka se enkriptuje po metodi više ključeva, gde se ne može lozinka dekriptovati pogađanjem ključa već se samo potvrđuje legitimitet sa unesenom lozinkom. Nijedan administrator Iskre ne može videti originalnu lozinku zbog principa zaštite podataka korisnika.

Učenici koji su prijavljeni kodom za nastavnu grupu nemaju enrkipciju podrazumevanu, međutim imaju stepen zaštite da se na njihovu instancu privremenog naloga ne može pristupiti ponovo sa istog ili različitog uređaja tokom sesije ili nakon odjave.

## Deljenje podataka sa trećim licima
Iskra se oslanja na infrastrukturu ostalih servisa kako bi funkcionisala optmizovano i u skladu sa standardima kvaliteta platforme.

Podaci se dele sa sledećim trećim licima:

 1. MongoDB Atlas - čuvanje svih podataka u jedinstvenoj bazi, zajedno sa enkriptovanom lozinkom
 2. Render, Railway i Hugging Face - održavanje servera, iako nemaju pristup čuvanju podataka, mogu imati kratkotrajan uvid u protok podatak u toku procesa komunikacije servera.
 3. Hugging Face Spaces - Kontejner za obradu Python koda, može imati kratkotrajan uvid u poslat kod, ali bez uvida u ostale podatke ni u jednom trenutku.
 4. Google Firebase - komunicira aktivno sa klijentskom instancom aplikacije za utvrđivanje statusa radova i prikazivanja adekvatnog korisničkog iskustva.
 
## Analitika
Iskra može periodično pratiti ponašanja korisnika i deliti ih sa trećim licima.

Trenutni partner Iskra edukativnog sistema jeste Metrica, prate se podaci o tačnosti zadataka, učestalosti kreiranja grupa, prijava, odjava, registracija korisnika, kreiranja zadataka, sakrivanja i otkrivanja foldera profesora i ostalih ponašanja, ali bez povezivanja sa konkretnim korisnikom, Metrica prima podatke o vremenu iyvršenja radnje i države iz koje je radnja protekla.

Zajedno sa Metricom podatke o IP adresi ima i servis [ipapi.com](https://ipapi.co/) koji Metrici ukazuje na zemlju porekla ponašanja korisnika.

Za analitiku se koriste i usluge prikupljanja podataka Vercel Analytics.
Informacije o prikupljanju analitike (Vercel Analytics) nalaze se ispod.
## Ovlašćenja u uvid podataka
Podatke o učenicima mogu videti profesori koji predaju tim učenicima i svi koji aktivno rade na razvoju platforme, kroz podatke o napretku učenika.

## Politike privatnosti trećih lica

-   **MongoDB Atlas Privacy Policy** [https://www.mongodb.com/legal/privacy/privacy-policy](https://www.mongodb.com/legal/privacy/privacy-policy)
-   **Render Privacy Policy** [https://render.com/privacy](https://render.com/privacy)
-   **Railway Privacy Policy** [https://railway.com/legal/privacy](https://railway.com/legal/privacy)
-   **Hugging Face Privacy Policy** [https://huggingface.co/privacy](https://huggingface.co/privacy)
-   **Google Firebase (Google Cloud) Privacy Notice** [https://firebase.google.com/support/privacy](https://firebase.google.com/support/privacy)
-   **Vercel Analytics** [https://vercel.com/docs/analytics/privacy-policy](https://vercel.com/docs/analytics/privacy-policy)
## Odricanje od odgovornosti
Ova politika može biti menjana u svakom trenutku bez prethodnih obaveštenja korisnicima, očekuje se da korisnici periodično posećuju ovu stranicu za potencijalna ažuriranja. Iskra nije odgovorna za eventualne propuste ili greške u ovom zapisniku. Iskra nije dužna da prati promene u politikama privatnosti trećih lica i njihovoj dostupnosti.

Za eventualne greške u čuvanju podataka, njihovom gubitku kao i nedostupnosti servisa, Iskra ne odgovara.

Upotreba Iskra edukativnog sistema podrazumeva slaganje sa politikom privatnosti i uslovima upotrebe.

**Hvala Vam što koristite Iskra edukativni sistem.**

Poslednja izmena: 25. mart 2026.
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