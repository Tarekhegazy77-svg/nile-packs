/** Prefix site-relative paths with the GitHub Pages basePath. */
export function assetPath(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  const base = "/nile-packs";
  if (path.startsWith(`${base}/`) || path === base) return path;
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}
