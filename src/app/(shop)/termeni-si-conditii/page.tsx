import type { Metadata } from "next";
import { STORE_NAME } from "@/lib/config";
import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = { title: "Termeni și condiții" };

export default async function TermsPage() {
  const settings = await getStoreSettings();

  return (
    <LegalPage title="Termeni și condiții">
      <LegalSection heading="1. Informații generale">
        <p>
          Acest site este operat de {STORE_NAME} (denumit în continuare „Magazinul”). Utilizarea site-ului și
          plasarea de comenzi implică acceptarea integrală a acestor termeni și condiții. Vă rugăm să îi citiți cu
          atenție înainte de a comanda.
        </p>
        <p>
          Ne puteți contacta oricând la {settings.contactEmail} sau la {settings.contactPhone} pentru orice
          întrebare legată de acești termeni.
        </p>
      </LegalSection>

      <LegalSection heading="2. Produse și prețuri">
        <p>
          Toate prețurile afișate pe site sunt exprimate în RON (lei) și includ TVA. Prețul aplicabil este cel
          afișat în momentul plasării comenzii; acesta este salvat ca atare în comandă și nu se modifică ulterior.
        </p>
        <p>
          Imaginile produselor au caracter informativ. Ne străduim ca descrierile și specificațiile să fie corecte
          și actualizate; în cazul unor erori evidente de afișare, vă vom contacta înainte de onorarea comenzii.
        </p>
      </LegalSection>

      <LegalSection heading="3. Comanda și încheierea contractului">
        <p>
          Comanda se plasează online, prin adăugarea produselor în coș și completarea datelor de livrare. Plata se
          efectuează exclusiv online, cu cardul, prin procesatorul de plăți Stripe. Contractul de vânzare se
          consideră încheiat în momentul confirmării plății.
        </p>
        <p>
          Comenzile pentru care plata nu este confirmată nu sunt procesate și nu rezervă stoc. Stocul se alocă
          comenzii doar după confirmarea plății.
        </p>
      </LegalSection>

      <LegalSection heading="4. Livrare">
        <p>
          Livrarea se face pe teritoriul României, prin curier, în 1-3 zile lucrătoare de la confirmarea plății.
          Costul livrării este afișat în coș și la finalizarea comenzii; comenzile peste pragul afișat beneficiază
          de livrare gratuită. Detalii complete pe pagina „Livrare”.
        </p>
      </LegalSection>

      <LegalSection heading="5. Dreptul de retragere">
        <p>
          Conform OUG 34/2014, aveți dreptul de a vă retrage din contract în termen de 14 zile calendaristice de la
          primirea produselor, fără a fi nevoie să justificați decizia. Detalii complete și procedura de retur se
          găsesc pe pagina „Politica de retur”.
        </p>
      </LegalSection>

      <LegalSection heading="6. Garanții și conformitate">
        <p>
          Produsele beneficiază de garanția legală de conformitate prevăzută de legislația în vigoare. În cazul
          unui produs neconform, vă rugăm să ne contactați pentru remediere, înlocuire sau restituirea
          contravalorii, conform legii.
        </p>
      </LegalSection>

      <LegalSection heading="7. Răspundere și proprietate intelectuală">
        <p>
          Conținutul site-ului (texte, imagini, elemente grafice) aparține Magazinului și nu poate fi reprodus fără
          acord scris. Magazinul nu răspunde pentru întreruperi tehnice independente de voința sa, dar va depune
          toate eforturile pentru remedierea rapidă a acestora.
        </p>
      </LegalSection>

      <LegalSection heading="8. Soluționarea litigiilor">
        <p>
          Orice neînțelegere va fi soluționată pe cale amiabilă. Consumatorii pot apela la Autoritatea Națională
          pentru Protecția Consumatorilor (ANPC), la entitatea de Soluționare Alternativă a Litigiilor (SAL) sau la
          platforma europeană de Soluționare Online a Litigiilor (SOL) — linkuri disponibile în subsolul site-ului.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
