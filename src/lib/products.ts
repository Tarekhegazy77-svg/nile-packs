export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  includes: string[];
  priceLE: number;
  featured: boolean;
};

export const products: Product[] = [
  {
    id: "starter-pack",
    slug: "starter-pack",
    name: "Starter Pack",
    description:
      "Everything you need to launch a polished digital product in an afternoon. Core template plus a guided quick-start PDF so you skip the blank-page panic.",
    includes: ["Core template", "Quick-start PDF"],
    priceLE: 19.99,
    featured: true,
  },
  {
    id: "pro-pack",
    slug: "pro-pack",
    name: "Pro Pack",
    description:
      "Level up from starter with a curated icon set, presentation mockups, and a launch checklist used by working freelancers.",
    includes: [
      "Starter Pack contents",
      "Icon set",
      "Presentation mockups",
      "Launch checklist",
    ],
    priceLE: 49.99,
    featured: true,
  },
  {
    id: "agency-bundle",
    slug: "agency-bundle",
    name: "Agency Bundle",
    description:
      "Built for studios shipping client work at pace. Pro assets plus a full brand kit and an extended commercial license.",
    includes: [
      "Pro Pack contents",
      "Brand kit",
      "Extended commercial license",
    ],
    priceLE: 99.99,
    featured: true,
  },
  {
    id: "launch-kit",
    slug: "launch-kit",
    name: "Launch Kit",
    description:
      "Ship a landing page and nurture sequence without starting from zero. High-converting templates paired with ready-to-adapt email copy.",
    includes: ["Landing page templates", "Email copy pack"],
    priceLE: 79.99,
    featured: false,
  },
  {
    id: "creator-assets",
    slug: "creator-assets",
    name: "Creator Assets",
    description:
      "Social-first visuals for creators who post daily. Templates and cover sets that stay on-brand across platforms.",
    includes: ["Social media templates", "Cover set"],
    priceLE: 29.99,
    featured: false,
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
    priceLE: 149.99,
    featured: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}
