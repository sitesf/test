/**
 * Tufani seed script — idempotent (safe to run multiple times):
 *  - admin account from ADMIN_EMAIL / ADMIN_PASSWORD (required env vars)
 *  - store settings (single row)
 *  - 6 categories + 20 products with Romanian sales copy and specs
 *
 * Prices are stored in bani (1 RON = 100 bani). Product images are
 * placehold.co placeholders meant to be replaced with real photos later.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { STORE_NAME, DEFAULT_SETTINGS } from "../src/lib/config";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { name: "Bucătărie", slug: "bucatarie" },
  { name: "Casă", slug: "casa" },
  { name: "Pet", slug: "pet" },
  { name: "Wellness & Beauty", slug: "wellness-beauty" },
  { name: "Auto & Travel", slug: "auto-travel" },
  { name: "Lifestyle", slug: "lifestyle" },
];

/** Placeholder image (PNG) with the product name — replaced later with real photos. */
function img(bgHex: string, text: string): string {
  return `https://placehold.co/600x800/${bgHex}/333333.png?text=${encodeURIComponent(text)}`;
}

/** Three placeholder images per product: main, details, in-use. */
function images(bgHex: string, label: string): string[] {
  return [img(bgHex, label), img(bgHex, `${label}\nDetalii`), img(bgHex, `${label}\nIn utilizare`)];
}

// Pastel backgrounds per category (placeholders only — not used in the UI).
const CATEGORY_BG: Record<string, string> = {
  bucatarie: "FFF0DE",
  casa: "E5F0FF",
  pet: "DDEFE3",
  "wellness-beauty": "FCE4F0",
  "auto-travel": "E8E8F5",
  lifestyle: "FFE8DD",
};

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
type SeedProduct = {
  name: string;
  slug: string;
  category: string; // category slug
  price: number; // bani
  salePrice?: number; // bani
  stock: number;
  featured?: boolean;
  heroColor?: string;
  imageLabel: string; // ASCII text for the placeholder
  description: string;
  specs: { label: string; value: string }[];
};

const PRODUCTS: SeedProduct[] = [
  {
    name: "Mini-imprimantă termică portabilă Bluetooth",
    slug: "mini-imprimanta-termica-portabila-bluetooth",
    category: "lifestyle",
    price: 12900,
    stock: 25,
    featured: true,
    heroColor: "#FCE4F0",
    imageLabel: "Mini-imprimanta termica",
    description: `Transformă-ți telefonul într-o mică tipografie de buzunar. Mini-imprimanta termică se conectează prin Bluetooth la iPhone sau Android și imprimă în câteva secunde notițe, liste, etichete, citate, mici fotografii alb-negru sau planuri pentru ziua în curs — totul fără cerneală, fără toner, fără bătăi de cap. Tehnologia termică folosește exclusiv hârtie specială, deci singurul „consumabil” este rola, ieftină și ușor de găsit.

Este companionul perfect pentru studenți (fișe de învățare lipite direct în caiet), pentru pasionații de bullet journaling și planner-e, dar și pentru micile afaceri care vor etichete rapide pentru pachete sau prețuri. Aplicația dedicată include șabloane, fonturi, bannere și conversia fotografiilor în stil retro.

Bateria de 1000 mAh se încarcă prin USB-C și rezistă la sute de imprimări per încărcare, iar întregul aparat cântărește cât un măr — îl arunci în ghiozdan sau în poșetă și îl ai mereu la tine. Include o rolă de hârtie pentru start, ca să poți imprima din primul minut.`,
    specs: [
      { label: "Conectivitate", value: "Bluetooth 5.1, aplicație iOS & Android" },
      { label: "Tehnologie", value: "Imprimare termică, fără cerneală" },
      { label: "Lățime hârtie", value: "57 mm (rolă standard)" },
      { label: "Rezoluție", value: "203 dpi" },
      { label: "Baterie", value: "1000 mAh, încărcare USB-C" },
      { label: "Greutate", value: "160 g" },
    ],
  },
  {
    name: "Lacăt portabil de ușă pentru călătorii",
    slug: "lacat-portabil-de-usa-pentru-calatorii",
    category: "auto-travel",
    price: 6900,
    stock: 4,
    imageLabel: "Lacat portabil de usa",
    description: `Dormi liniștit oriunde ai înnopta. Lacătul portabil de ușă adaugă un strat suplimentar de siguranță în camere de hotel, apartamente închiriate în regim Airbnb, cămine sau garsoniere — locuri în care nu știi niciodată câte copii ale cheii circulă. Se montează în câteva secunde, din interior, fără unelte, fără șuruburi și fără să lase vreo urmă pe ușă.

Mecanismul din oțel inoxidabil blochează fizic deschiderea ușii chiar dacă cineva are cheie sau card de acces. Funcționează pe majoritatea ușilor care se deschid spre interior, cu broască standard — pur și simplu introduci placa metalică în contraplacă, închizi ușa și fixezi clema roșie.

Pliat, încape în buzunarul rucsacului și cântărește doar 120 de grame, deci nu îl simți în bagaj. Este alegerea practică pentru persoanele care călătoresc singure, pentru studenți și pentru oricine își dorește un plus de control asupra spațiului în care doarme. Un gest mic, o liniște imensă.`,
    specs: [
      { label: "Material", value: "Oțel inoxidabil" },
      { label: "Montare", value: "Fără unelte, fără urme, din interior" },
      { label: "Compatibilitate", value: "Uși cu deschidere spre interior, broască standard" },
      { label: "Dimensiuni pliat", value: "14 × 4 cm" },
      { label: "Greutate", value: "120 g" },
    ],
  },
  {
    name: "Set 2 linere silicon reutilizabile air fryer",
    slug: "set-2-linere-silicon-reutilizabile-air-fryer",
    category: "bucatarie",
    price: 7900,
    salePrice: 5900,
    stock: 40,
    imageLabel: "Linere silicon air fryer",
    description: `Gata cu frecatul coșului de air fryer după fiecare masă. Linerele din silicon alimentar se așază direct în coș, prind grăsimea și resturile lipicioase, iar la final le clătești sau le pui în mașina de spălat vase. Coșul rămâne curat, iar stratul antiaderent al friteuzei este protejat de zgârieturi — adică aparatul tău trăiește mai mult.

Spre deosebire de hârtia de unică folosință, linerele din set sunt reutilizabile ani de zile: siliconul platinum, fără BPA, rezistă până la 230°C și nu transferă mirosuri sau gusturi între preparate. Baza cu striații ridică ușor alimentele, astfel încât aerul fierbinte circulă dedesubt și cartofii, aripioarele sau legumele ies crocante, nu înmuiate.

Diametrul de 20 cm se potrivește în majoritatea air fryer-elor între 3 și 6 litri, iar mânerele laterale te ajută să scoți preparatul fără să te frigi. Două bucăți în set: una la gătit, una curată, mereu pregătită. O investiție mică pentru cea mai folosită „tigaie” din bucătăria modernă.`,
    specs: [
      { label: "Material", value: "Silicon platinum alimentar, fără BPA" },
      { label: "Rezistență termică", value: "Până la 230°C" },
      { label: "Diametru", value: "20 cm — compatibil cu air fryer 3-6 L" },
      { label: "Curățare", value: "Lavabile în mașina de spălat vase" },
      { label: "Conținut set", value: "2 bucăți" },
    ],
  },
  {
    name: "Mini pistol de masaj cu 4 capete",
    slug: "mini-pistol-de-masaj-cu-4-capete",
    category: "wellness-beauty",
    price: 17900,
    stock: 18,
    featured: true,
    heroColor: "#FFE8DD",
    imageLabel: "Mini pistol de masaj",
    description: `Relaxarea profundă nu mai depinde de programări la masaj. Mini pistolul de masaj cu percuție lucrează în profunzimea mușchilor obosiți după sport, după o zi la birou sau după orele lungi petrecute la volan, stimulând circulația și reducând senzația de tensiune și febră musculară.

Cele 4 capete interschimbabile acoperă tot corpul: capul rotund pentru grupele mari (coapse, fesieri), capul plat pentru spate, capul tip furculiță pentru zona coloanei și a tendonului lui Ahile, iar cel tip glonț pentru punctele de declanșare. Cu 6 trepte de intensitate, alegi totul — de la o relaxare blândă de seară până la o recuperare serioasă post-antrenament.

În ciuda puterii, aparatul rămâne surprinzător de silențios (sub 45 dB, cât o conversație în șoaptă) și de compact: 380 de grame, cât să-l ții lejer cu o mână sau să-l iei la sală în rucsac. Bateria de 1500 mAh se încarcă prin USB-C și ține până la 6 ore de utilizare. Mușchii tăi vor face diferența din prima săptămână.`,
    specs: [
      { label: "Capete de masaj", value: "4 interschimbabile (rotund, plat, furculiță, glonț)" },
      { label: "Intensitate", value: "6 trepte de viteză" },
      { label: "Nivel de zgomot", value: "Sub 45 dB" },
      { label: "Baterie", value: "1500 mAh, încărcare USB-C" },
      { label: "Autonomie", value: "Până la 6 ore" },
      { label: "Greutate", value: "380 g" },
    ],
  },
  {
    name: "Masajor electric pentru scalp",
    slug: "masajor-electric-pentru-scalp",
    category: "wellness-beauty",
    price: 11900,
    stock: 22,
    imageLabel: "Masajor electric scalp",
    description: `Senzația aceea minunată de la coafor, în fiecare seară, la tine acasă. Masajorul de scalp imită mișcarea degetelor unui maseur profesionist: cele 4 capete rotative cu 84 de noduri fine petrec pielea capului într-un masaj care relaxează instant, reduce tensiunea acumulată peste zi și transformă rutina de îngrijire într-un mic ritual de răsfăț.

Masajul regulat al scalpului stimulează circulația locală — un aliat de încredere pentru un păr cu aspect mai sănătos — și este, sincer, una dintre cele mai plăcute metode de a te deconecta înainte de culcare. Cele două viteze și două direcții de rotație îți permit să alegi între o mângâiere blândă și un masaj mai ferm.

Fiind complet rezistent la apă (IPX7), îl poți folosi la duș, cu șampon, pentru o spălare-masaj de zile mari, dar funcționează la fel de bine pe păr uscat, pe umeri sau pe gambe. Bateria reîncărcabilă prin USB ține aproximativ 90 de minute — adică vreo două săptămâni de sesiuni zilnice de 5 minute. Răsfăț mic, efect mare.`,
    specs: [
      { label: "Capete de masaj", value: "4 capete rotative, 84 noduri din silicon" },
      { label: "Moduri", value: "2 viteze, 2 direcții de rotație" },
      { label: "Rezistență la apă", value: "IPX7 — utilizabil la duș" },
      { label: "Baterie", value: "Reîncărcabilă prin USB" },
      { label: "Autonomie", value: "Aproximativ 90 de minute" },
    ],
  },
  {
    name: "Fântână de apă pentru pisici cu filtru",
    slug: "fantana-de-apa-pentru-pisici-cu-filtru",
    category: "pet",
    price: 14900,
    stock: 15,
    featured: true,
    heroColor: "#DDEFE3",
    imageLabel: "Fantana de apa pisici",
    description: `Pisicile beau instinctiv mai multă apă atunci când aceasta curge — moștenire de la strămoșii lor sălbatici, pentru care apa în mișcare însemna apă proaspătă. Fântâna cu circulație continuă valorifică exact acest instinct: jetul blând și suprafața mereu oxigenată invită pisica să bea mai des, susținând sănătatea rinichilor și a tractului urinar, punctul sensibil al majorității pisicilor de apartament.

Sistemul de filtrare triplă (burete pentru păr și impurități, cărbune activ pentru mirosuri, strat de bumbac pentru sedimente) menține apa curată zile întregi, iar rezervorul generos de 2,4 litri ajunge unei pisici pentru aproape o săptămână. Fereastra transparentă cu plutitor îți arată dintr-o privire când e momentul reumplerii.

Pompa consumă doar 2 W și funcționează sub 30 dB — practic inaudibilă, inclusiv noaptea, în dormitor. Materialele ABS fără BPA se demontează complet și se spală ușor. Dacă pisica ta „cere” apă de la robinet, această fântână va deveni rapid locul ei preferat din casă.`,
    specs: [
      { label: "Capacitate", value: "2,4 L" },
      { label: "Filtrare", value: "Triplă: burete, cărbune activ, bumbac" },
      { label: "Zgomot pompă", value: "Sub 30 dB" },
      { label: "Consum", value: "2 W" },
      { label: "Material", value: "ABS fără BPA, demontabil complet" },
      { label: "Indicator", value: "Fereastră nivel apă cu plutitor" },
    ],
  },
  {
    name: "Rolă electrică pentru păr de animale",
    slug: "rola-electrica-pentru-par-de-animale",
    category: "pet",
    price: 8900,
    stock: 30,
    imageLabel: "Rola par de animale",
    description: `Canapeaua plină de păr nu mai e o fatalitate când împarți casa cu un câine sau o pisică. Rola electrică adună părul de animale de pe canapele, pleduri, lenjerii, haine și scaune auto dintr-o singură trecere: peria rotativă cu dublu sens „piaptănă” țesătura și colectează firele în rezervorul intern, fără să le împrăștie în aer.

Spre deosebire de rolele adezive clasice, aici nu există consumabile: nu rupi folii, nu arunci nimic, nu cumperi rezerve. Când rezervorul s-a umplut, îl deschizi, arunci ghemul de păr la coș și continui. E mai economic, mai ecologic și mult mai eficient pe părul încăpățânat, intrat adânc în fibra textilelor.

Se încarcă prin USB-C și funcționează fără fir, deci ajungi lejer la tetierele din mașină sau la colțurile canapelei. Ușoară și ergonomică, devine rapid obiceiul de 2 minute dinaintea vizitelor — trecerea rapidă peste canapea și casa arată ca și cum nu ai avea animale. Doar că le ai, și e minunat.`,
    specs: [
      { label: "Alimentare", value: "Baterie reîncărcabilă, USB-C" },
      { label: "Perie", value: "Cap rotativ cu dublu sens" },
      { label: "Colectare", value: "Rezervor detașabil, golire rapidă" },
      { label: "Utilizare", value: "Canapele, paturi, haine, scaune auto" },
      { label: "Consumabile", value: "Zero — complet reutilizabilă" },
    ],
  },
  {
    name: "Blender portabil USB 380 ml",
    slug: "blender-portabil-usb-380-ml",
    category: "bucatarie",
    price: 12900,
    stock: 20,
    imageLabel: "Blender portabil USB",
    description: `Smoothie proaspăt la birou, la sală sau în drum spre facultate — fără să cari un blender de 2 kilograme după tine. Blenderul portabil de 380 ml amestecă fructe, iaurt, lapte vegetal sau pudră proteică direct în paharul din care bei, în 30-40 de secunde. Apeși de două ori butonul, cele 6 lame din oțel inoxidabil pornesc, iar micul vortex face restul.

Bateria de 1500 mAh se încarcă prin USB-C (de la laptop, priză sau powerbank) și ajunge pentru 8-12 utilizări, în funcție de cât de ambițioase îți sunt rețetele. Pentru fructe congelate, secretul e să adaugi lichid și să le lași un minut la dezghețat — blenderul se descurcă apoi fără probleme.

Paharul din Tritan fără BPA nu reține mirosuri, iar sistemul de siguranță pornește lamele doar cu capacul înfiletat corect. Se spală în 10 secunde: jumătate de pahar de apă, o picătură de detergent, două pulsuri și e gata curat. Mic, colorat și surprinzător de hotărât — exact ce-i trebuie unei rutine sănătoase ca să reziste.`,
    specs: [
      { label: "Capacitate", value: "380 ml" },
      { label: "Lame", value: "6 lame din oțel inoxidabil" },
      { label: "Baterie", value: "1500 mAh, încărcare USB-C" },
      { label: "Utilizări per încărcare", value: "8-12" },
      { label: "Material pahar", value: "Tritan fără BPA" },
      { label: "Siguranță", value: "Funcționează doar cu capacul fixat" },
    ],
  },
  {
    name: "Tocător de legume multifuncțional 14-în-1",
    slug: "tocator-de-legume-multifunctional-14-in-1",
    category: "bucatarie",
    price: 12900,
    salePrice: 9900,
    stock: 35,
    imageLabel: "Tocator legume 14-in-1",
    description: `Jumătate din timpul petrecut la gătit e, de fapt, tăiat. Tocătorul 14-în-1 îl reduce dramatic: cuburi perfecte de ceapă fără lacrimi, julien de morcov pentru salate, felii egale de castravete, cartofi pai, usturoi tocat mărunt — fiecare cu accesoriul lui, schimbat într-o secundă. Apeși capacul și legumele cad gata tăiate în containerul colector de 1,2 litri, nu pe blat.

Lamele din oțel inoxidabil rămân ascuțite în timp, iar grila de tăiere se curăță cu peria inclusă sau direct în mașina de spălat vase. Mănușa de protecție și împingătorul te țin departe de lame chiar și atunci când termini ultimul colț de legumă.

Picioarele antiderapante fixează tocătorul pe blat, ca să poți lucra repede și în siguranță. Tot setul se strânge compact, cu accesoriile depozitate în container — un singur obiect în dulap, paisprezece unelte la îndemână. Pentru ciorbe, salate, meal prep de duminică sau borcanele de toamnă, e genul de gadget care chiar rămâne pe blat, nu în sertar.`,
    specs: [
      { label: "Accesorii", value: "14 interschimbabile (cuburi, julien, felii, răzători)" },
      { label: "Lame", value: "Oțel inoxidabil" },
      { label: "Container colector", value: "1,2 L cu capac" },
      { label: "Siguranță", value: "Mănușă de protecție + împingător incluse" },
      { label: "Stabilitate", value: "Picioare antiderapante" },
    ],
  },
  {
    name: "Cutie de prânz electrică 220V + 12V auto",
    slug: "cutie-de-pranz-electrica-220v-12v-auto",
    category: "bucatarie",
    price: 15900,
    stock: 3,
    imageLabel: "Cutie de pranz electrica",
    description: `Mâncare caldă, gătită acasă, oriunde te prinde prânzul. Cutia electrică încălzește mâncarea lent și uniform, ca o mini-bain-marie: o umpli dimineața, o bagi în priză cu 30-40 de minute înainte de masă, iar la prânz mănânci cald, nu „călduț pe margini și rece la mijloc” ca de la microunde — și fără coada de la cuptorul comun al biroului.

Marele ei atu este alimentarea dublă: cablu de 220 V pentru birou și cablu de 12 V pentru priza de brichetă a mașinii. Șoferii profesioniști, agenții de vânzări mereu pe drum și cei care lucrează pe șantier știu exact cât valorează o masă caldă la volan.

Compartimentul interior din oțel inoxidabil (1 L) se scoate complet pentru spălare, iar capacul etanș păstrează mâncarea la locul ei în rucsac. Setul include lingură și furculiță, ca să fii cu adevărat autonom. Puterea de 40 W încălzește blând, fără să ardă mâncarea, exact cum trebuie pentru orez, paste, tocănițe sau resturile glorioase de la cina de ieri.`,
    specs: [
      { label: "Alimentare", value: "Dublă: 220 V (priză) + 12 V (auto)" },
      { label: "Capacitate", value: "1 L, compartiment inox detașabil" },
      { label: "Timp de încălzire", value: "30-40 de minute" },
      { label: "Putere", value: "40 W" },
      { label: "Accesorii", value: "Lingură și furculiță incluse" },
    ],
  },
  {
    name: "Aparat de sigilat pungi 2-în-1",
    slug: "aparat-de-sigilat-pungi-2-in-1",
    category: "bucatarie",
    price: 4900,
    stock: 60,
    imageLabel: "Aparat sigilat pungi",
    description: `Chipsuri răsuflate, cafea care își pierde aroma, făină vărsată în dulap — toate au aceeași cauză: punga deschisă. Aparatul de sigilat 2-în-1 o rezolvă în 3 secunde: treci aparatul de-a lungul pungii, banda termică retopește folia și punga e din nou închisă ermetic, ca din fabrică. Aerul și umezeala rămân afară, prospețimea rămâne înăuntru.

Partea de „2-în-1” e cea care îl face cu adevărat practic: pe lângă sigilare, are și o lamă de tăiere glisantă, cu care deschizi pungile drept și curat, fără foarfecă și fără smucituri care împrăștie jumătate din conținut. Sigilezi, tai, resigilezi — același obiect mic cât un capsator.

Funcționează cu 2 baterii AA (neincluse), nu are cabluri, iar magnetul de pe spate îl ține lipit de frigider, mereu la îndemână. Merge pe pungile de plastic obișnuite: snacksuri, cereale, paste, legume congelate, mâncare de pisici. Un gadget de 49 de lei care își amortizează prețul din primele pungi salvate de la coș.`,
    specs: [
      { label: "Funcții", value: "Sigilare termică + tăiere cu lamă glisantă" },
      { label: "Alimentare", value: "2 × AA (neincluse)" },
      { label: "Timp de sigilare", value: "Aproximativ 3 secunde" },
      { label: "Depozitare", value: "Magnet pentru frigider" },
      { label: "Compatibilitate", value: "Pungi de plastic uzuale (snacks, congelate, cereale)" },
    ],
  },
  {
    name: "Bandă LED cu senzor de mișcare 1 m, reîncărcabilă",
    slug: "banda-led-cu-senzor-de-miscare-1-m-reincarcabila",
    category: "casa",
    price: 6900,
    stock: 45,
    imageLabel: "Banda LED senzor miscare",
    description: `Lumina care se aprinde singură exact când ai nevoie de ea. Lipești banda LED sub dulapul din bucătărie, în dressing, pe hol sau sub pat, iar senzorul de mișcare o aprinde instant când treci prin dreptul ei și o stinge automat după ce pleci. Fără întrerupătoare căutate pe întuneric, fără becuri aprinse degeaba.

Lumina caldă de 3000 K e suficient de blândă pentru drumul nocturn spre bucătărie — nu te trezește complet, cum o face becul alb din tavan — și suficient de clară ca să găsești ce cauți în sertar sau în șifonier. Senzorul detectează mișcarea de la aproximativ 3 metri și funcționează doar pe întuneric, deci ziua nu consumă nimic.

Instalarea durează un minut: banda magnetică se prinde pe suportul autoadeziv, fără găuri și fără electrician. Bateria reîncărcabilă prin USB-C ține săptămâni întregi de utilizare normală, iar când e descărcată, desprinzi banda de pe magnet și o încarci la orice priză. Una pentru dressing, una pentru hol — vei vedea casa altfel. La propriu.`,
    specs: [
      { label: "Lungime", value: "1 m" },
      { label: "Senzor", value: "PIR, rază de detecție ~3 m, doar pe întuneric" },
      { label: "Temperatura de culoare", value: "3000 K (lumină caldă)" },
      { label: "Baterie", value: "Reîncărcabilă, USB-C" },
      { label: "Montaj", value: "Magnetic, pe suport autoadeziv — fără găuri" },
      { label: "Stingere automată", value: "La ~15-20 s după ultima mișcare" },
    ],
  },
  {
    name: "Aspirator mini wireless auto + birou",
    slug: "aspirator-mini-wireless-auto-birou",
    category: "auto-travel",
    price: 14900,
    stock: 12,
    imageLabel: "Aspirator mini wireless",
    description: `Firimituri între scaune, nisip pe covorașe, praf în suporturile de pahare — interiorul mașinii adună mizerie cu o viteză impresionantă. Aspiratorul mini wireless o elimină la fel de repede: fără fir, cu putere de aspirare de 6 kPa și trei duze dedicate (perie, fantă îngustă, furtun flexibil), ajunge în toate cotloanele în care aspiratorul de acasă nici nu visează să intre.

La 400 de grame, îl manevrezi cu o singură mână, iar bateria de 2000 mAh ține aproximativ 20 de minute — suficient pentru o curățenie completă a mașinii sau pentru biroul plin de firimituri de la prânzurile mâncate pe tastatură. Se încarcă prin USB-C, inclusiv de la priza mașinii sau de la powerbank.

Filtrul HEPA reține praful fin și se spală cu apă, deci nu cumperi consumabile. Recipientul transparent se golește printr-o singură apăsare. Ține-l în torpedou sau în sertarul biroului: mizeria mică, tratată pe loc, nu mai apucă niciodată să devină mizerie mare.`,
    specs: [
      { label: "Putere de aspirare", value: "6 kPa" },
      { label: "Baterie", value: "2000 mAh, încărcare USB-C" },
      { label: "Autonomie", value: "~20 de minute" },
      { label: "Filtru", value: "HEPA, lavabil" },
      { label: "Accesorii", value: "3 duze: perie, fantă, furtun flexibil" },
      { label: "Greutate", value: "400 g" },
    ],
  },
  {
    name: "Suport telefon magnetic pliabil MagSafe",
    slug: "suport-telefon-magnetic-pliabil-magsafe",
    category: "lifestyle",
    price: 7900,
    stock: 50,
    imageLabel: "Suport telefon MagSafe",
    description: `Telefonul tău merită mai mult decât să zacă întins pe birou. Suportul magnetic pliabil se prinde instant de spatele iPhone-ului (12 sau mai nou) ori al oricărei carcase compatibile MagSafe și îl ține exact în poziția de care ai nevoie: vertical pentru apeluri video și rețete în bucătărie, orizontal pentru filme și seriale, înclinat pe birou pentru notificările văzute dintr-o privire.

Magneții puternici din interior țin telefonul ferm — îl poți atinge, tasta și derula fără ca suportul să se clintească — iar balamaua cu fricțiune reglabilă rămâne fixă în orice unghi o lași. Construcția din aliaj de zinc cu tălpi de silicon antialunecare îi dă o stabilitate pe care suporturile de plastic doar o promit.

Pliat, devine o plăcuță de 45 de grame care dispare în buzunarul de la blugi sau în husa laptopului: la birou, în avion, pe noptiera de la hotel, oriunde. Se transformă și în grip pentru fotografii sau în suport pentru priză de încărcare. Mic detaliu, confort zilnic mare.`,
    specs: [
      { label: "Compatibilitate", value: "MagSafe — iPhone 12+ și carcase magnetice" },
      { label: "Material", value: "Aliaj de zinc + silicon antialunecare" },
      { label: "Unghi", value: "Reglabil, balama cu fricțiune fermă" },
      { label: "Dimensiune pliat", value: "Format de buzunar" },
      { label: "Greutate", value: "45 g" },
    ],
  },
  {
    name: "Aparat de curățare cu ultrasunete bijuterii și ochelari",
    slug: "aparat-curatare-ultrasunete-bijuterii-ochelari",
    category: "casa",
    price: 16900,
    stock: 8,
    imageLabel: "Aparat curatare ultrasunete",
    description: `Verigheta care nu mai strălucește, ochelarii cu depuneri la balamale, ceasul cu brățara îmbâcsită — toate au nevoie de o curățare pe care laveta pur și simplu nu o poate face. Aparatul cu ultrasunete generează 46.000 de vibrații pe secundă în apă, creând milioane de micro-bule care desprind murdăria din cele mai fine crăpături, acolo unde nicio perie nu ajunge.

Folosirea e simplă: umpli cuva de 600 ml cu apă (eventual cu o picătură de detergent de vase), așezi obiectele în coșul inclus, alegi unul dintre cele 5 programe de timp (90-480 de secunde) și apeși start. În câteva minute, bijuteriile ies ca din vitrină, iar ochelarii — impecabil de limpezi, inclusiv la nas și balamale.

Funcționează excelent pe lanțuri, inele, cercei, rame de ochelari, ceasuri cu brățară metalică rezistentă la apă, proteze dentare și chiar capete de aparat de ras. Carcasa compactă încape pe orice raft de baie, iar oprirea automată face totul fără supraveghere. Curățare profesională, fără abonament la bijutier.`,
    specs: [
      { label: "Frecvență ultrasunete", value: "46 kHz" },
      { label: "Capacitate cuvă", value: "600 ml, oțel inoxidabil" },
      { label: "Programe", value: "5 durate: 90-480 de secunde" },
      { label: "Putere", value: "35 W" },
      { label: "Utilizări", value: "Bijuterii, ochelari, ceasuri, proteze dentare" },
      { label: "Siguranță", value: "Oprire automată la final de program" },
    ],
  },
  {
    name: "Aparat electric de îndepărtat scame",
    slug: "aparat-electric-de-indepartat-scame",
    category: "casa",
    price: 9900,
    salePrice: 7900,
    stock: 28,
    imageLabel: "Aparat de indepartat scame",
    description: `Puloverul preferat nu e stricat — e doar plin de scame. Aparatul electric le îndepărtează în câteva treceri și redă hainelor aspectul de „proaspăt cumpărat”: lamele rotative din oțel taie biluțele de material la firul ierbii, fără să agațe sau să subțieze țesătura, iar scamele ajung ordonat în rezervorul transparent.

Funcționează pe pulovere, cardigane, paltoane, dar și pe canapele, pleduri, lenjerii sau șosete groase de iarnă — practic pe orice textil care a început să arate obosit. Distanțierul reglabil cu 3 înălțimi protejează tricotajele delicate sau lasă lama mai aproape pentru materialele dense.

Bateria reîncărcabilă prin USB-C elimină bateriile de unică folosință și cablurile incomode: o încărcare ține pentru multe sesiuni de „resuscitat” garderoba. Capul de tăiere se demontează pentru curățare, iar peria mică inclusă întreține lamele în formă maximă. E diferența dintre a arunca hainele „îmbătrânite” și a le mai purta, impecabile, încă niște ierni întregi.`,
    specs: [
      { label: "Lame", value: "Rotative, oțel inoxidabil, cap demontabil" },
      { label: "Alimentare", value: "Baterie reîncărcabilă, USB-C" },
      { label: "Protecție țesături", value: "Distanțier reglabil, 3 înălțimi" },
      { label: "Colectare", value: "Rezervor transparent detașabil" },
      { label: "Utilizare", value: "Pulovere, paltoane, canapele, pleduri" },
    ],
  },
  {
    name: "Set ice roller facial + gua sha",
    slug: "set-ice-roller-facial-gua-sha",
    category: "wellness-beauty",
    price: 6900,
    stock: 4,
    imageLabel: "Set ice roller gua sha",
    description: `Cinci minute dimineața care îți schimbă toată fața zilei. Rola cu efect de răcire se ține în frigider sau congelator, iar la prima utilizare înțelegi tot hype-ul: senzația rece trezește instant tenul, calmează roșeața și reduce vizibil aspectul pufos al feței de dimineață, în special în zona ochilor. E echivalentul unui duș rece — dar plăcut — pentru ten.

Piatra gua sha completează ritualul seara: mișcările lente de-a lungul maxilarului, pomeților și gâtului relaxează mușchii feței încordați de stres și de orele în fața ecranelor, stimulând în același timp circulația și drenajul limfatic. Folosită cu un ulei sau ser, alunecă fin și transformă rutina de îngrijire într-un moment de mindfulness autentic.

Mânerul rolei se detașează pentru depozitare ușoară, iar materialele hipoalergenice sunt blânde inclusiv cu tenul sensibil. Un cadou superb — pentru o prietenă sau pentru tine — la un preț care nu cere nicio justificare. Pielea ta o să-l ceară zilnic.`,
    specs: [
      { label: "Conținut set", value: "Ice roller cu mâner detașabil + piatră gua sha" },
      { label: "Utilizare", value: "Față, zona ochilor, gât, decolteu" },
      { label: "Răcire", value: "15 minute în frigider sau congelator" },
      { label: "Materiale", value: "Hipoalergenice, blânde cu tenul sensibil" },
      { label: "Întreținere", value: "Se clătește cu apă călduță după utilizare" },
    ],
  },
  {
    name: "Set 10 discuri demachiante reutilizabile + săculeț",
    slug: "set-10-discuri-demachiante-reutilizabile-saculet",
    category: "wellness-beauty",
    price: 5900,
    stock: 55,
    imageLabel: "Discuri demachiante reutilizabile",
    description: `O singură schimbare mică în rutina de seară, sute de discuri de unică folosință care nu mai ajung la gunoi. Setul de 10 discuri demachiante reutilizabile face exact ce fac cele clasice — demachiază blând, cu apă micelară, lapte demachiant sau doar apă caldă — dar în loc să le arunci, le pui în săculețul inclus și le speli la mașină. A doua zi sunt ca noi.

Țesătura dublă din fibre de bambus și bumbac este surprinzător de plăcută: o față catifelată pentru zona delicată a ochilor, una ușor texturată pentru curățarea în profunzime a tenului și îndepărtarea măștilor. Nu lasă scame, nu irită și rezistă la sute de cicluri de spălare fără să se deformeze.

Fă un calcul rapid: un pachet de discuri clasice la 2-3 săptămâni, ani la rând, versus un set reutilizabil de 59 de lei. Economia e evidentă, gestul pentru mediu la fel. Săculețul de spălare le ține pe toate la un loc, iar pielea ta primește în fiecare seară o textură mai fină decât a oricărui disc de unică folosință.`,
    specs: [
      { label: "Conținut set", value: "10 discuri + săculeț de spălare" },
      { label: "Material", value: "Fibre de bambus + bumbac, două texturi" },
      { label: "Diametru", value: "8 cm" },
      { label: "Întreținere", value: "Lavabile la mașină, la 60°C" },
      { label: "Durată de viață", value: "Sute de utilizări per disc" },
    ],
  },
  {
    name: "Sticlă de apă 1 L cu marcaje de timp și infuzor",
    slug: "sticla-de-apa-1-l-cu-marcaje-de-timp-si-infuzor",
    category: "lifestyle",
    price: 8500,
    salePrice: 6500,
    stock: 33,
    imageLabel: "Sticla apa 1L cu marcaje",
    description: `„Azi beau mai multă apă” — promisiunea pe care o facem toți și o uităm până la prânz. Sticla cu marcaje orare o transformă în ceva concret: pe peretele ei scrie, oră cu oră, unde ar trebui să fii cu hidratarea („8:00 — un start bun!”, „13:00 — jumătate!”), iar simplul fapt că vezi obiectivul te face să-l atingi. E cel mai low-tech și mai eficient „reminder” de hidratare inventat.

Pentru zilele în care apa simplă pare plictisitoare, infuzorul detașabil intră în scenă: lămâie și mentă, căpșuni, castravete, fructe de pădure — apa capătă gust fără zahăr și fără calorii, iar tu ajungi natural la litrul recomandat.

Corpul din Tritan fără BPA este ușor, rezistent la căzături și nu reține mirosuri sau pete. Capacul cu închidere etanșă și curea de transport o face companionul ideal pentru birou, sală, drumeții sau cursuri. Un litru întreg înseamnă mai puține reumpleri și niciun pretext. Hidratarea, rezolvată elegant.`,
    specs: [
      { label: "Capacitate", value: "1 L" },
      { label: "Marcaje", value: "Orare motivaționale, 8:00-22:00" },
      { label: "Infuzor", value: "Detașabil, pentru fructe și ierburi" },
      { label: "Material", value: "Tritan fără BPA, nu reține mirosuri" },
      { label: "Capac", value: "Etanș, cu curea de transport" },
    ],
  },
  {
    name: "Pluș cu greutate dinozaur 1,5 kg",
    slug: "plus-cu-greutate-dinozaur-1-5-kg",
    category: "lifestyle",
    price: 13900,
    stock: 10,
    featured: true,
    heroColor: "#E3EEFF",
    imageLabel: "Plus cu greutate dinozaur",
    description: `Există un motiv pentru care păturile cu greutate au cucerit lumea: presiunea blândă și constantă are un efect profund liniștitor, asemănător unei îmbrățișări lungi. Dinozaurul nostru de pluș aduce același principiu într-o formă mult mai simpatică — 1,5 kg de calm, distribuite uniform într-un corp moale de 60 cm, cu umplutură de microbile fine de sticlă.

Așezat pe piept, pe genunchi sau în brațe, devine ancora perfectă pentru serile agitate, pentru anxietatea dinaintea examenelor sau pentru copiii (3+) care adorm greu. Greutatea îl face să „stea” în brațe altfel decât orice jucărie de pluș obișnuită — mulți adulți îl cumpără „pentru copil” și sfârșesc prin a-l confisca pentru propriile sesiuni de citit pe canapea.

Exteriorul din catifea super-moale este delicat cu pielea, iar designul cu spatele cusut în segmente îi dă o postură adorabilă, ușor cocoșată, de dinozaur relaxat. Materialele sunt hipoalergenice, iar suprafața se curăță ușor. Cadoul care pare o glumă drăguță și se dovedește cel mai folosit obiect din casă.`,
    specs: [
      { label: "Greutate", value: "1,5 kg — umplutură microbile de sticlă" },
      { label: "Lungime", value: "60 cm" },
      { label: "Exterior", value: "Catifea super-moale, hipoalergenică" },
      { label: "Întreținere", value: "Curățare delicată a suprafeței, la 30°C" },
      { label: "Vârstă recomandată", value: "3+ ani (și adulți, fără limită)" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------
async function main() {
  console.log(`🌱 Seed ${STORE_NAME} — start`);

  // 1. Admin account — credentials come exclusively from the environment.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Setați ADMIN_EMAIL și ADMIN_PASSWORD în fișierul .env înainte de a rula seed-ul (vezi .env.example)."
    );
  }
  const passwordHash = await hash(adminPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { passwordHash },
    create: { email: adminEmail.toLowerCase(), name: "Administrator", passwordHash },
  });
  console.log(`✔ Admin: ${adminEmail.toLowerCase()}`);

  // 2. Store settings (single row, id = 1). Existing values are kept.
  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_SETTINGS },
  });
  console.log("✔ Setări magazin");

  // 3. Categories.
  const categoryIds = new Map<string, string>();
  for (const category of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    });
    categoryIds.set(category.slug, row.id);
  }
  console.log(`✔ ${CATEGORIES.length} categorii`);

  // 4. Products (upsert by slug — re-running the seed never duplicates).
  for (const product of PRODUCTS) {
    const categoryId = categoryIds.get(product.category);
    if (!categoryId) throw new Error(`Categorie necunoscută: ${product.category}`);

    const bg = product.heroColor?.replace("#", "") ?? CATEGORY_BG[product.category];
    const data = {
      name: product.name,
      description: product.description,
      specs: product.specs,
      price: product.price,
      salePrice: product.salePrice ?? null,
      stock: product.stock,
      images: images(bg, product.imageLabel),
      active: true,
      featured: product.featured ?? false,
      heroColor: product.heroColor ?? null,
      categoryId,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: data,
      create: { slug: product.slug, ...data },
    });
  }
  console.log(`✔ ${PRODUCTS.length} produse`);

  const featuredCount = await prisma.product.count({ where: { featured: true, active: true } });
  console.log(`✔ Produse în caruselul hero: ${featuredCount}/4`);
  console.log("🌱 Seed finalizat cu succes.");
}

main()
  .catch((err) => {
    console.error("Eroare la seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
