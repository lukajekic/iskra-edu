import ReactMarkdown from 'react-markdown';

const termsContent = `
# Uslovi korišćenja platforme Iskra

**Poslednja izmena:** 26. februar 2026.

Dobrodošli na platformu **Iskra**. Korišćenjem naših usluga, prihvatate pravila navedena u nastavku. Molimo vas da ih pažljivo pročitate.

---

### 1. Prihvatanje uslova
Pristupanjem i korišćenjem platforme Iskra, potvrđujete da ste pročitali, razumeli i prihvatili ove Uslove korišćenja. Ukoliko se ne slažete sa bilo kojom odredbom, molimo vas da odmah prestanete sa korišćenjem platforme.

### 2. Opis usluge
Iskra je digitalni alat namenjen unapređenju produktivnosti u učionicama tokom obrade lekcija programiranja. Iskra zadržava pravo da u bilo kom trenutku izmeni, suspenduje ili privremeno prekine bilo koji deo usluge radi održavanja ili unapređenja sistema, bez prethodne najave.

### 3. Registracija i bezbednost naloga
* **Tačnost podataka:** Korisnik je dužan da prilikom registracije unese tačne i važeće podatke.
* **Odgovornost:** Vi ste isključivo odgovorni za poverljivost svoje lozinke i sve aktivnosti koje se izvrše pod vašim nalogom.
* **Pristup:** Strogo je zabranjeno deljenje pristupnih podataka sa trećim licima, kao i neovlašćeni pristup tuđim nalozima. Svaka sumnja na kompromitovan nalog mora biti odmah prijavljena administraciji.

### 4. Pravila ponašanja i zabranjene aktivnosti
Korisnicima je strogo zabranjeno:
* Korišćenje platforme u svrhe koje nisu u skladu sa zakonom.
* Postavljanje ili distribucija uvredljivog, pretećeg, diskriminatorskog ili neprikladnog sadržaja.
* Sajber napadi, pokušaji ometanja rada servera (DDoS) ili neovlašćeno prikupljanje (*scraping*) podataka drugih korisnika.
* Bilo koji vid uznemiravanja drugih korisnika ili slanje neželjenih komercijalnih poruka (*spam*).

### 5. Intelektualna svojina i Open Source transparentnost
* **Vlasništvo:** Vizuelni identitet, logotip, dizajn i tekstovi su vlasništvo platforme Iskra.
* **Izvorni kod:** Iako je izvorni kod platforme javno dostupan radi transparentnosti i uviđaja u način obrade podataka, **zabranjeno je repliciranje (kloniranje) platforme u komercijalne svrhe** ili kreiranje konkurentskih servisa bez izričite pismene dozvole autora.
* **Distribucija:** Neovlašćeno kopiranje i distribucija delova platforme koji nisu obuhvaćeni javnom licencom je kažnjivo.

### 6. Ograničenje odgovornosti
* **"As-is" model:** Iskra pruža usluge u viđenom stanju ("onakve kakve jesu"). Ne garantujemo da će rad platforme biti neprekidan i bez tehničkih grešaka.
* **Korisnički sadržaj:** Iskra ne vrši prethodnu kontrolu sadržaja zadataka, koda ili poruka koje generišu korisnici. Ti sadržaji ne predstavljaju stavove autora platforme, te Iskra ne snosi odgovornost za njihovu tačnost ili prirodu.
* **Šteta:** U maksimalnoj meri dozvoljenoj zakonom, Iskra se odriče odgovornosti za bilo kakvu direktnu ili indirektnu štetu nastalu korišćenjem ili nemogućnošću korišćenja platforme.

### 7. Prekid saradnje
Iskra zadržava diskreciono pravo da suspenduje ili trajno obriše nalog korisnika koji krši ove Uslove, bez prethodne opomene, ukoliko se proceni da je došlo do ozbiljnog ugrožavanja platforme ili drugih korisnika.

### 8. Izmene uslova
Zadržavamo pravo na izmenu ovih Uslova u bilo kom trenutku. Svaka izmena stupa na snagu momentom objavljivanja na ovoj stranici. Nastavak korišćenja platforme nakon objavljenih izmena smatra se vašim pristankom na nove uslove.

### 9. Kontakt
Za sva pitanja, primedbe ili prijave problema, možete nas kontaktirati putem e-pošte:
**Email:** [lukajekic913@gmail.com](mailto:lukajekic913@gmail.com)
`;

function Terms() {
  return (
    <div className='markdown-container' style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <ReactMarkdown >
        {termsContent}
      </ReactMarkdown>
    </div>
  );
}

export default Terms