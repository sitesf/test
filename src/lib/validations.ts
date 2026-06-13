import { z } from "zod";

/** All Romanian counties + Bucharest, used by the checkout county select. */
export const JUDETE = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani",
  "Brașov", "Brăila", "București", "Buzău", "Caraș-Severin", "Călărași",
  "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu",
  "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș",
  "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Satu Mare", "Sălaj",
  "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vaslui", "Vâlcea",
  "Vrancea",
] as const;

/** Romanian phone number: 07xxxxxxxx / 02x / 03x, optional +4 / 004 prefix. */
const phoneRegex = /^(\+4|004)?0(7\d{8}|[23]\d{8})$/;

/**
 * Checkout payload — validated on the client (instant feedback) AND on the
 * server (/api/checkout), which is the source of truth.
 */
export const checkoutSchema = z.object({
  customer: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Introduceți numele complet (minim 3 caractere)."),
    email: z.string().trim().email("Introduceți o adresă de email validă."),
    phone: z
      .string()
      .transform((v) => v.replace(/[\s.\-()]/g, ""))
      .pipe(z.string().regex(phoneRegex, "Introduceți un număr de telefon valid (ex. 07xx xxx xxx).")),
    address: z
      .string()
      .trim()
      .min(8, "Introduceți adresa completă (stradă, număr, bloc/apartament)."),
    county: z
      .string()
      .refine((v) => (JUDETE as readonly string[]).includes(v), "Selectați județul."),
    city: z.string().trim().min(2, "Introduceți localitatea."),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Coșul este gol."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Product create/update payload for the admin API. Amounts are in bani. */
export const productSchema = z
  .object({
    name: z.string().trim().min(3, "Numele trebuie să aibă minim 3 caractere."),
    slug: z
      .string()
      .trim()
      .min(3, "Slug-ul trebuie să aibă minim 3 caractere.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug-ul poate conține doar litere mici, cifre și cratime."),
    categoryId: z.string().min(1, "Selectați o categorie."),
    description: z.string().trim().min(20, "Descrierea trebuie să aibă minim 20 de caractere."),
    specs: z
      .array(z.object({ label: z.string().trim().min(1), value: z.string().trim().min(1) }))
      .min(1, "Adăugați cel puțin o specificație."),
    price: z.number().int("Prețul trebuie să fie în bani (întreg).").positive("Prețul trebuie să fie pozitiv."),
    salePrice: z.number().int().positive().nullable(),
    stock: z.number().int().min(0, "Stocul nu poate fi negativ."),
    images: z.array(z.string().trim().url("Fiecare imagine trebuie să fie un URL valid.")).min(1, "Adăugați cel puțin o imagine."),
    active: z.boolean(),
    featured: z.boolean(),
    heroColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Culoarea trebuie să fie în format hex (#RRGGBB).")
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.salePrice !== null && data.salePrice >= data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Prețul redus trebuie să fie mai mic decât prețul de bază.",
      });
    }
  });

export type ProductInput = z.infer<typeof productSchema>;

/** Category create/update payload. */
export const categorySchema = z.object({
  name: z.string().trim().min(2, "Numele trebuie să aibă minim 2 caractere."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug-ul trebuie să aibă minim 2 caractere.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug-ul poate conține doar litere mici, cifre și cratime."),
});

/** Store settings payload. Amounts are in bani. */
export const settingsSchema = z.object({
  storeName: z.string().trim().min(2, "Numele magazinului este obligatoriu."),
  contactEmail: z.string().trim().email("Email de contact invalid."),
  contactPhone: z.string().trim().min(6, "Telefon de contact invalid."),
  shippingCost: z.number().int().min(0, "Costul de livrare nu poate fi negativ."),
  freeShippingThreshold: z.number().int().min(0, "Pragul nu poate fi negativ."),
});

/** Order update payload (status change + AWB) for the admin. */
export const orderUpdateSchema = z.object({
  status: z.enum(["NOUA", "PLATITA", "EXPEDIATA", "LIVRATA", "ANULATA"]),
  awb: z.string().trim().max(64).optional().nullable(),
});
