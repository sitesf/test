import type { Metadata } from "next";
import { STORE_NAME } from "@/lib/config";
import { getStoreSettings } from "@/lib/store-settings";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = { title: "Politica de confidențialitate" };

export default async function PrivacyPage() {
  const settings = await getStoreSettings();

  return (
    <LegalPage title="Politica de confidențialitate">
      <LegalSection heading="1. Cine suntem">
        <p>
          {STORE_NAME} prelucrează date cu caracter personal în calitate de operator, în conformitate cu
          Regulamentul (UE) 2016/679 („GDPR”) și legislația națională aplicabilă. Pentru orice solicitare legată de
          datele dumneavoastră ne puteți contacta la {settings.contactEmail}.
        </p>
      </LegalSection>

      <LegalSection heading="2. Ce date colectăm și de ce">
        <p>Colectăm doar datele strict necesare pentru onorarea comenzilor:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-foreground">Date de comandă</strong> — nume, email, telefon, adresă de livrare
            (județ, localitate, stradă). Temei: executarea contractului (art. 6 alin. 1 lit. b GDPR).
          </li>
          <li>
            <strong className="text-foreground">Date de plată</strong> — procesate exclusiv de Stripe; Magazinul nu
            stochează niciodată datele cardului dumneavoastră.
          </li>
          <li>
            <strong className="text-foreground">Date tehnice</strong> — cookie-uri strict necesare pentru coșul de
            cumpărături și sesiunea de plată. Temei: interes legitim (art. 6 alin. 1 lit. f GDPR).
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Cui transmitem datele">
        <p>
          Datele sunt transmise doar partenerilor strict necesari livrării serviciului: procesatorul de plăți
          Stripe, firma de curierat (pentru livrare) și furnizorul de găzduire. Nu vindem și nu închiriem datele
          dumneavoastră către terți.
        </p>
      </LegalSection>

      <LegalSection heading="4. Cât timp păstrăm datele">
        <p>
          Datele aferente comenzilor sunt păstrate pe durata impusă de legislația fiscală și contabilă (în prezent
          10 ani pentru documentele justificative). Datele care nu mai sunt necesare sunt șterse sau anonimizate.
        </p>
      </LegalSection>

      <LegalSection heading="5. Drepturile dumneavoastră">
        <p>Conform GDPR, beneficiați de următoarele drepturi:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>dreptul de acces la datele prelucrate;</li>
          <li>dreptul la rectificarea datelor inexacte;</li>
          <li>dreptul la ștergerea datelor („dreptul de a fi uitat”), în condițiile legii;</li>
          <li>dreptul la restricționarea prelucrării;</li>
          <li>dreptul la portabilitatea datelor;</li>
          <li>dreptul de opoziție și de a nu face obiectul unei decizii automate;</li>
          <li>
            dreptul de a depune o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu
            Caracter Personal (ANSPDCP — dataprotection.ro).
          </li>
        </ul>
        <p>
          Pentru exercitarea acestor drepturi, trimiteți o cerere la {settings.contactEmail}. Răspundem în maximum
          30 de zile calendaristice.
        </p>
      </LegalSection>

      <LegalSection heading="6. Cookie-uri">
        <p>
          Site-ul folosește exclusiv cookie-uri strict necesare funcționării: păstrarea coșului de cumpărături
          (stocare locală în browser) și sesiunea de autentificare pentru administrare. Nu folosim cookie-uri de
          marketing sau profilare. Preferința dumneavoastră privind cookie-urile este memorată local, în browser.
        </p>
      </LegalSection>

      <LegalSection heading="7. Securitatea datelor">
        <p>
          Aplicăm măsuri tehnice și organizatorice adecvate: conexiuni criptate (HTTPS), acces restricționat la
          datele comenzilor, parole stocate criptat și procesarea plăților exclusiv prin infrastructura certificată
          PCI-DSS a Stripe.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
