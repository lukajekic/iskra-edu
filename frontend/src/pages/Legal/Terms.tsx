import ReactMarkdown from 'react-markdown';

const termsContent = `

# Uslovi upotrebe

## 1. Prihvatanje uslova
Korišćenjem platforme Iskra, korisnik (učenik ili profesor) u potpunosti prihvata ove uslove. Ukoliko se ne slažete sa bilo kojim delom, molimo Vas da odmah prestanete sa korišćenjem sistema.

## 2. Opis usluge
Iskra je edukativna platforma namenjena automatizaciji testiranja koda i upravljanju nastavnim procesom. Autor zadržava pravo da u bilo kom trenutku izmeni, suspenduje ili prekine rad bilo kog dela platforme bez prethodne najave.

## 3. Pravila ponašanja i zloupotreba
Korisnicima je strogo zabranjeno:
- Slanje zlonamernog koda (malware, fork bombs, beskonačne petlje) koji može ugroziti stabilnost servera.
- Pokušaj neovlašćenog pristupa tuđim nalozima ili bazi podataka (XSS, DDoS,...).
- Korišćenje tuđih pristupnih kodova za privremene naloge.
- Automatizovano "preopterećenje" servera zahtevima (DDoS).

> **Napomena:** Svaki pokušaj ugrožavanja integriteta sistema može rezultirati trajnom blokadom naloga i prijavom nadležnim organima škole.

## 4. Intelektualna svojina
- **Platforma:** Sav izvorni kod Iskra sistema je javno dostupan, ali je njegova reprodukcija i implementacija zabranjena bez odobrenja autora. Autor Iskre objavljuje kod platforme javno kao podsticaj učenicima naprednog znanja da imaju ideju o funkcionisanju sistema i toku podataka. 
- **Korisnički sadržaj:** Učenici zadržavaju autorska prava na kôd koji pošalju, ali Iskra ima pravo da taj kôd skladišti i obrađuje u svrhu ocenjivanja i provere plagijata.

## 5. Ograničenje odgovornosti
Iskra se isporučuje "u viđenom stanju". Autor ne garantuje:
- Da će sistem raditi bez prekida.
- Da su automatski generisane ocene i povratne informacije uvek tačne.
- Da neće doći do gubitka podataka usled tehničkih kvarova trećih lica ili od strane autora (Render, MongoDB, itd.).

**Korisnik prihvata da autor nije odgovoran za bilo kakvu štetu (gubitak ocene, propušten rok) nastalu usled tehničkih problema platforme.**

## 6. Nalozi i bezbednost
- Korisnici su odgovorni za čuvanje svojih pristupnih podataka.
- Privremeni nalozi su ograničenog trajanja i biće automatski obrisani nakon isteka predviđenog perioda i kreiranjem nove nastavne grupe ili prevremenim prekidom važenja grupe.

## 7. Izmene uslova
Autor zadržava pravo da izmeni ove uslove u bilo kom trenutku. Nastavak korišćenja platforme nakon izmena smatra se prihvatanjem novih uslova. Očekuje se da korisnik periodično posećuje ovu stranicu kako bi posedovao ažurne informacije o uslovima upotrebe.

**Hvala Vam što koristite Iskra edukativni sistem.**

Poslednja izmena: 19. mart 2026.
`;

function Terms() {
  return (
    <div className="md-wrapper">
       <div className='markdown-container' style={{  }}>
      <ReactMarkdown >
        {termsContent}
      </ReactMarkdown>
    </div>
    </div>
   
  );
}

export default Terms