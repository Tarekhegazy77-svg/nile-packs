/** Seed catalog mirroring src/lib/products.ts — kept in sync manually. */
export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  includes: string[];
  priceLE: number;
  featured: boolean;
  image?: string;
  inStock: boolean;
  stockQty: number | null;
  removed: boolean;
};

export const SEED_PRODUCTS: AdminProduct[] = [
  {
    id: "starter-pack",
    slug: "starter-pack",
    name: "Starter Pack",
    description:
      "Launch a polished digital product in an afternoon — core template plus a quick-start PDF so you skip the blank page.",
    includes: ["Core template", "Quick-start PDF"],
    priceLE: 749.99,
    featured: true,
    image: "/products/starter-pack.png",
    inStock: true,
    stockQty: null,
    removed: false,
  },
  {
    id: "pro-pack",
    slug: "pro-pack",
    name: "Pro Pack",
    description:
      "Starter Pack plus a curated icon set, presentation mockups, and a launch checklist freelancers actually use.",
    includes: [
      "Everything in Starter Pack",
      "Icon set",
      "Presentation mockups",
      "Launch checklist",
    ],
    priceLE: 1949.99,
    featured: true,
    image: "/products/pro-pack.png",
    inStock: true,
    stockQty: null,
    removed: false,
  },
  {
    id: "agency-bundle",
    slug: "agency-bundle",
    name: "Agency Bundle",
    description:
      "Built for studios shipping client work fast — Pro Pack assets, a full brand kit, and an extended commercial license.",
    includes: [
      "Everything in Pro Pack",
      "Brand kit",
      "Extended commercial license",
    ],
    priceLE: 7449.99,
    featured: true,
    image: "/products/agency-bundle.png",
    inStock: true,
    stockQty: null,
    removed: false,
  },
  {
    id: "launch-kit",
    slug: "launch-kit",
    name: "Launch Kit",
    description:
      "Ship a landing page and nurture sequence without starting from scratch — high-converting templates plus ready email copy.",
    includes: ["Landing page templates", "Email copy pack"],
    priceLE: 1849.99,
    featured: false,
    inStock: true,
    stockQty: null,
    removed: false,
  },
  {
    id: "creator-assets",
    slug: "creator-assets",
    name: "Creator Assets",
    description:
      "Social-first visuals for creators who post daily — templates and cover sets that stay on-brand across platforms.",
    includes: ["Social media templates", "Cover set"],
    priceLE: 1449.99,
    featured: false,
    inStock: true,
    stockQty: null,
    removed: false,
  },
  {
    id: "all-access-bundle",
    slug: "all-access-bundle",
    name: "All-Access Bundle",
    description:
      "Every package in the catalog — templates, kits, licenses, and creator assets — in one download with lifetime updates.",
    includes: [
      "Starter Pack",
      "Pro Pack",
      "Agency Bundle",
      "Launch Kit",
      "Creator Assets",
      "Lifetime updates",
    ],
    priceLE: 9949.99,
    featured: true,
    image: "/products/all-access-bundle.png",
    inStock: true,
    stockQty: null,
    removed: false,
  },
];
