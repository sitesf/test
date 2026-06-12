import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/store-settings";
import { formatPrice } from "@/lib/utils";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = { title: "Livrare" };

export default async function ShippingPage() {
  const settings = await getStoreSettings();

  return (
    <LegalPage title="Livrare">
      <LegalSection heading="1. Aria de livrare">
        <p>
          Livrăm în toată România, prin curier rapid, la adresa indicată în comandă. Momentan nu livrăm în afara
          țării.
        </p>
      </LegalSection>

      <LegalSection heading="2. Costuri de livrare">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Cost standard: <strong className="text-foreground">{formatPrice(settings.shippingCost)}</strong> per
            comandă, indiferent de numărul de produse.
          </li>
          <li>
            Livrare <strong className="text-foreground">gratuită</strong> pentru comenzile de cel puțin{" "}
            <strong className="text-foreground">{formatPrice(settings.freeShippingThreshold)}</strong>.
          </li>
        </ul>
        <p>Costul exact este afișat transparent în coș și în pagina de finalizare a comenzii, înainte de plată.</p>
      </LegalSection>

      <LegalSection heading="3. Termen de livrare">
        <p>
          Comenzile plătite până la ora 14:00 în zilele lucrătoare se predau curierului în aceeași zi sau în
          următoarea zi lucrătoare. Termenul de livrare este de regulă{" "}
          <strong className="text-foreground">1-3 zile lucrătoare</strong> de la expediere, în funcție de
          localitate.
        </p>
        <p>
          După expediere, statusul comenzii devine „Expediată” și primiți numărul AWB pentru urmărirea coletului.
        </p>
      </LegalSection>

      <LegalSection heading="4. Recepția coletului">
        <p>
          Vă recomandăm să verificați coletul la primire. Dacă ambalajul prezintă deteriorări vizibile, puteți
          refuza primirea sau puteți nota acest lucru în prezența curierului și ne contactați imediat la{" "}
          {settings.contactEmail} pentru remediere.
        </p>
      </LegalSection>

      <LegalSection heading="5. Comenzi neonorate de curier">
        <p>
          Dacă livrarea nu este posibilă (adresă incompletă, destinatar de negăsit), curierul reia livrarea sau
          coletul revine la noi. Vă contactăm pentru reprogramare; costurile reexpedierii pot fi facturate
          suplimentar dacă adresa furnizată a fost greșită.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
