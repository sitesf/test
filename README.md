# ✦ Tufani — Magazin online

Magazin online complet, production-ready, pentru piața din România: catalog de produse, coș persistent, plăți cu cardul prin **Stripe Checkout (RON)**, panou de administrare protejat și pagini legale conforme (GDPR, OUG 34/2014, ANPC/SOL).

> Numele magazinului este definit într-o **singură constantă** — `STORE_NAME` în `src/lib/config.ts`. Schimbă o linie și tot site-ul (logo, metadata, prefix comenzi, e-mailuri) se rebranduiește.

## Stack

| Componentă | Tehnologie |
| --- | --- |
| Frontend & backend | Next.js 14 (App Router) + TypeScript |
| Stilizare | Tailwind CSS (design tokens prin CSS variables), Framer Motion, lucide-react, shadcn/ui (Button) |
| Bază de date | PostgreSQL + Prisma ORM |
| Plăți | Stripe Checkout (RON) + webhook verificat prin semnătură |
| Autentificare admin | NextAuth (Credentials, JWT) |
| Deploy | Render (web service + PostgreSQL) — `render.yaml` inclus |

## Funcționalități

- **Hero carusel** cu cele 4 produse „featured” (fundal pastel animat, text ghost cu categoria, navigare cu lock de animație, preload imagini)
- **Catalog** (`/produse`) cu filtrare pe categorie, sortare (preț, popularitate, noutăți) și căutare; badge-uri „Reducere” și „Stoc limitat” (sub 5 bucăți)
- **Pagină de produs** cu galerie, descriere lungă, specificații, produse similare și micro-interacțiune la adăugarea în coș
- **Coș** persistat în `localStorage`: drawer lateral + pagină dedicată `/cos`
- **Checkout** cu validare Zod pe client **și** pe server → Stripe Checkout → `/comanda-confirmata`
- **Stocul scade doar la confirmarea plății prin webhook** (nu la redirect) — comanda devine „Plătită” exclusiv prin webhook-ul semnat
- **Admin** (`/admin`): dashboard cu grafice SVG hand-crafted (curbe Bézier + gradient accent 15%), CRUD produse (cu flag „featured” — exact 4 în carusel), comenzi cu schimbare status + AWB, CRUD categorii, setări magazin (contact, cost livrare, prag livrare gratuită)
- **Pagini legale RO**: termeni și condiții, politică de confidențialitate (GDPR), politică de retur (14 zile, OUG 34/2014), livrare + linkuri ANPC/SOL în footer + banner consimțământ cookies

## Instalare locală

Cerințe: **Node.js 18.18+**, **PostgreSQL** (local sau remote) și un cont **Stripe** (test mode).

```bash
# 1. Instalează dependențele (rulează automat `prisma generate`)
npm install

# 2. Configurează variabilele de mediu
cp .env.example .env
#   -> completează DATABASE_URL, STRIPE_SECRET_KEY, NEXTAUTH_SECRET,
#      ADMIN_EMAIL, ADMIN_PASSWORD (vezi tabelul de mai jos)

# 3. Creează schema în baza de date
npx prisma db push

# 4. Populează baza de date (20 produse, categorii, admin, setări)
npm run db:seed

# 5. Pornește serverul de dezvoltare
npm run dev
```

Aplicația rulează pe [http://localhost:3000](http://localhost:3000). Panoul de administrare: [http://localhost:3000/admin](http://localhost:3000/admin) — autentificare cu `ADMIN_EMAIL` / `ADMIN_PASSWORD` din `.env`.

Pe scurt: `npm install && npx prisma db push && npm run db:seed && npm run dev`.

### Variabile de mediu (`.env`)

| Variabilă | Descriere |
| --- | --- |
| `DATABASE_URL` | Connection string PostgreSQL, ex. `postgresql://user:parola@localhost:5432/tufani` |
| `STRIPE_SECRET_KEY` | Cheia secretă Stripe (test: `sk_test_...`) — Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Secretul webhook-ului (`whsec_...`) — vezi secțiunea Stripe de mai jos |
| `NEXTAUTH_SECRET` | Secret pentru sesiuni; generează cu `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL-ul public al aplicației (`http://localhost:3000` local) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Contul de admin creat de seed |

**Nicio cheie nu este hardcodată în cod** — totul vine din `.env`.

## Configurare Stripe (test mode)

1. Creează un cont pe [stripe.com](https://stripe.com) și rămâi în **Test mode**.
2. Copiază cheia secretă din **Developers → API keys** în `STRIPE_SECRET_KEY`.
3. Pentru webhook-ul local, instalează [Stripe CLI](https://docs.stripe.com/stripe-cli) și rulează:

   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Comanda afișează un secret `whsec_...` — pune-l în `STRIPE_WEBHOOK_SECRET` și repornește serverul.
4. Testează o plată cu cardul de test `4242 4242 4242 4242` (orice dată viitoare, orice CVC).
5. Verifică în `/admin/comenzi` că, după plată, comanda a trecut din „Nouă” în **„Plătită”** și stocul produselor a scăzut — asta confirmă că webhook-ul funcționează.

> Important: comanda devine „Plătită” **doar** prin webhook (semnătura este verificată cu `STRIPE_WEBHOOK_SECRET`). Redirect-ul către pagina de succes nu modifică nimic în baza de date.

## Deploy pe Render

Repo-ul include `render.yaml` (Blueprint: web service + PostgreSQL).

1. Urcă proiectul pe GitHub.
2. În [Render Dashboard](https://dashboard.render.com): **New → Blueprint** → selectează repo-ul. Render creează automat serviciul web și baza de date din `render.yaml`.
3. La prompt, completează variabilele marcate `sync: false`:
   - `STRIPE_SECRET_KEY` — cheia secretă Stripe (live sau test);
   - `STRIPE_WEBHOOK_SECRET` — completezi după pasul 5 (poți pune temporar orice valoare);
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — contul de administrare;
   - `NEXTAUTH_URL` — `https://<numele-serviciului>.onrender.com` (îl afli după primul deploy).
4. După primul deploy, deschide **Shell**-ul serviciului în Render și rulează o singură dată:

   ```bash
   npm run db:seed
   ```

   (schema este creată automat la fiecare deploy de `preDeployCommand: npx prisma db push`).
5. În Stripe Dashboard → **Developers → Webhooks → Add endpoint**:
   - URL: `https://<numele-serviciului>.onrender.com/api/webhooks/stripe`
   - Evenimente: `checkout.session.completed`, `checkout.session.expired`
   - Copiază **Signing secret**-ul în variabila `STRIPE_WEBHOOK_SECRET` din Render și redă deploy.
6. Gata — magazinul e live, iar plățile confirmate apar ca „Plătită” în `/admin/comenzi`.

## Structura proiectului

```
prisma/
  schema.prisma        # Product, Category, Order(+snapshot prețuri), OrderItem, AdminUser, StoreSettings
  seed.ts              # 20 produse RO, categorii, admin din env, setări
src/
  app/
    (shop)/            # vitrina: acasă (hero), produse, produs/[slug], cos, checkout,
                       # comanda-confirmata, categorii, contact, pagini legale
    admin/             # login + (panel): dashboard, produse, comenzi, categorii, setări
    api/               # checkout, webhooks/stripe, auth, admin/*
  components/          # hero-carousel, product-card, cart (provider/drawer), admin/*
  lib/                 # config (STORE_NAME), prisma, stripe, auth, validations (Zod), utils
  middleware.ts        # protecția rutelor /admin
render.yaml            # Blueprint Render (web + PostgreSQL)
```

## Note de producție

- Prețurile sunt stocate ca **întregi, în bani** (1 RON = 100 bani) — fără erori de virgulă mobilă; comenzile păstrează snapshot-ul prețului din momentul achiziției.
- Imaginile din seed sunt placeholdere `placehold.co` — înlocuiește-le din admin (CRUD produse → câmpul imagini, un URL pe linie).
- Caruselul hero are nevoie de **exact 4 produse active marcate „featured”** (regula este impusă de API și semnalată în admin); dacă sunt mai puține, se completează automat cu cele mai noi produse.
- Webhook-ul este idempotent: relivrarea aceluiași eveniment Stripe nu dublează scăderea stocului.
