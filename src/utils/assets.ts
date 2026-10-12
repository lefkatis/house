/**
 * Resolves static asset URLs taking into account Vite's base path (e.g. '/pronies/')
 * and dynamic runtime origin (GitHub Pages vs Custom Domain root).
 * Ensures images and PDFs load correctly on GitHub Pages and custom domains without 404s.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  let cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Determine base dynamically:
  // If on GitHub Pages under /pronies/, base should be /pronies/
  // If on custom domain root like pronies.lefk.dev, base should be /
  let base = import.meta.env.BASE_URL || '/';
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/pronies')) {
      base = '/pronies/';
    } else {
      base = '/';
    }
  }

  const baseTrimmed = base.replace(/^\/|\/$/g, '');
  if (baseTrimmed && cleanPath.startsWith(`${baseTrimmed}/`)) {
    cleanPath = cleanPath.slice(`${baseTrimmed}/`.length);
  }

  return `${base}${cleanPath}`;
}
