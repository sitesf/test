import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = { title: "Politica de retur" };

export default async function ReturnsPage() {
  const settings = await getStoreSettings();

  return (
    <LegalPage title="Politica de retur">
      <LegalSection heading="1. Dreptul de retragere în 14 zile">
        <p>
          În conformitate cu OUG 34/2014 privind drepturile consumatorilor în cadrul contractelor încheiate la
          distanță, aveți dreptul de a vă retrage din contract în termen de{" "}
          <strong className="text-foreground">14 zile calendaristice</strong> de la data la care dumneavoastră (sau
          o terță parte indicată de dumneavoastră, alta decât curierul) intrați în posesia fizică a produselor,
          fără a fi nevoie să justificați decizia de retragere și fără penalități.
        </p>
      </LegalSection>

      <LegalSection heading="2. Cum returnați un produs">
        <ul className="list-decimal space-y-1.5 pl-5">
          <li>
            Ne anunțați decizia de retragere printr-o declarație neechivocă (email la {settings.contactEmail} sau
            telefonic la {settings.contactPhone}), menționând numărul comenzii.
          </li>
          <li>Expediați produsele înapoi în maximum 14 zile de la comunicarea deciziei de retragere.</li>
          <li>
            Produsele trebuie returnate în starea în care au fost primite, de preferință în ambalajul original, cu
            toate accesoriile incluse.
          </li>
        </ul>
        <p>Costul direct al returnării produselor este suportat de consumator, conform legii.</p>
      </LegalSection>

      <LegalSection heading="3. Rambursarea banilor">
        <p>
          Vă restituim toate sumele primite, inclusiv costul livrării inițiale (cu excepția costurilor suplimentare
          generate de alegerea unei alte modalități de livrare decât cea standard), în maximum{" "}
          <strong className="text-foreground">14 zile</strong> de la data la care suntem informați despre decizia de
          retragere. Putem amâna rambursarea până la primirea produselor înapoi sau până la primirea unei dovezi de
          expediere, oricare intervine prima.
        </p>
        <p>Rambursarea se face prin aceeași metodă de plată folosită la comandă (card, prin Stripe).</p>
      </LegalSection>

      <LegalSection heading="4. Diminuarea valorii produselor">
        <p>
          Sunteți responsabil doar pentru diminuarea valorii produselor rezultată din manipularea acestora, alta
          decât cea necesară pentru determinarea naturii, caracteristicilor și funcționării lor (similar probării
          într-un magazin fizic).
        </p>
      </LegalSection>

      <LegalSection heading="5. Excepții de la dreptul de retragere">
        <p>Conform art. 16 din OUG 34/2014, sunt exceptate de la dreptul de retragere, printre altele:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>produsele sigilate care nu pot fi returnate din motive de igienă, dacă au fost desigilate;</li>
          <li>produsele personalizate sau confecționate după specificațiile clientului;</li>
          <li>produsele susceptibile a se deteriora sau a expira rapid.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="6. Produse defecte sau neconforme">
        <p>
          Dacă ați primit un produs defect, deteriorat la transport sau diferit de cel comandat, contactați-ne în
          cel mai scurt timp la {settings.contactEmail}. În acest caz, toate costurile de retur sunt suportate de
          noi, iar produsul se înlocuiește sau se rambursează integral, la alegerea dumneavoastră, conform
          garanției legale de conformitate.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
