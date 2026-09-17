import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold text-nile-ink">
        Page not found
      </h1>
      <p className="mt-2 text-nile-muted">
        That route does not exist in this storefront.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-nile px-5 py-2.5 text-sm font-semibold text-sand"
      >
        Go home
      </Link>
    </div>
  );
}
