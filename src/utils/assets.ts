function getActivePasscode(): string {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('house_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.code) return parsed.code;
      }
      const cookieMatch = document.cookie.match(/house_client_auth=([^;]+)/);
      if (cookieMatch && cookieMatch[1]) return decodeURIComponent(cookieMatch[1]);
    } catch (e) {}
  }
  return 'andreas';
}

/**
 * Resolves static asset URLs taking into account Vite's base path
 * and dynamic runtime origin (GitHub Pages vs Custom Domain root).
 * Ensures images and PDFs load correctly on GitHub Pages and custom domains without 404s.
 */
export function getAssetUrl(path: string, authCode?: string): string {
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
  // If on GitHub Pages under /house/, base matches pathname
  // If on custom domain root like house.lefk.dev, base should be /
  let base = import.meta.env.BASE_URL || '/';
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/house')) {
      base = '/house/';
    } else {
      base = '/';
    }
  }

  const baseTrimmed = base.replace(/^\/|\/$/g, '');
  if (baseTrimmed && cleanPath.startsWith(`${baseTrimmed}/`)) {
    cleanPath = cleanPath.slice(`${baseTrimmed}/`.length);
  }

  let finalUrl = `${base}${cleanPath}`;

  // Ensure PDF URLs carry auth query parameter so Cloudflare Worker edge gate always authorizes access
  if (typeof window !== 'undefined' && (finalUrl.includes('.pdf') || cleanPath.endsWith('.pdf'))) {
    const code = authCode || getActivePasscode();
    if (code && !finalUrl.includes('auth=') && !finalUrl.includes('pass=') && !finalUrl.includes('code=')) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + `auth=${encodeURIComponent(code)}`;
    }
  }

  return finalUrl;
}

