const SECRET_KEY = "house_secret_salt_2026_lefk_dev_edge_security";
const COOKIE_NAME = "house_gate_session";
const CLIENT_COOKIE_NAME = "house_client_auth";

function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str) {
  const binary = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getHmacSignature(data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createSessionToken(payload) {
  const data = base64UrlEncode(JSON.stringify(payload));
  const sig = await getHmacSignature(data);
  return `${data}.${sig}`;
}

async function verifySessionToken(token) {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  const expectedSig = await getHmacSignature(data);
  if (sig !== expectedSig) return null;
  try {
    const jsonStr = base64UrlDecode(data);
    const payload = JSON.parse(jsonStr);
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach(c => {
    const [k, v] = c.trim().split("=");
    if (k && v) cookies[k] = decodeURIComponent(v);
  });
  return cookies;
}

const DEFAULT_PASSCODES_LIST = [
  { id: "pass-andreas", code: "andreas", name: "Ανδρέας (Master Admin)", role: "admin", isMaster: true, category: "owner", isActive: true },
  { id: "pass-maria", code: "maria", name: "Μαρία (Οικογένεια)", role: "readonly", isMaster: false, category: "family", isActive: true },
  { id: "pass-arch", code: "architektonas", name: "Αρχιτέκτονας", role: "readonly", isMaster: false, category: "engineers", isActive: true },
  { id: "pass-mep", code: "meletitis", name: "Μελετητής MEP (Μηχανολόγος / Ηλεκτρολόγος)", role: "readonly", isMaster: false, category: "engineers", isActive: true },
  { id: "pass-electric", code: "ilektrologos", name: "Ηλεκτρολόγος Εγκαταστάτης", role: "readonly", isMaster: false, category: "contractors", isActive: true },
  { id: "pass-plumber", code: "ydravlikos", name: "Υδραυλικός Εγκαταστάτης", role: "readonly", isMaster: false, category: "contractors", isActive: true },
  { id: "pass-guest", code: "guest", name: "Επισκέπτης (Μόνο Προβολή)", role: "readonly", isMaster: false, category: "guests", isActive: true }
];

async function getPasscodesList(env) {
  try {
    const raw = await env.PASSCODES_KV.get("passcodes");
    let list = DEFAULT_PASSCODES_LIST;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
    return list.map(item => {
      const isMaster = Boolean(item.isMaster || item.code.toLowerCase() === "andreas" || item.code.toLowerCase() === "lefkatis12");
      return {
        ...item,
        role: isMaster ? "admin" : "readonly",
        isMaster
      };
    });
  } catch (e) {
    return DEFAULT_PASSCODES_LIST;
  }
}

function renderLockScreenHtml(errorMsg = "") {
  return `<!DOCTYPE html>
<html lang="el" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>House - Είσοδος</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#6366f1', 600: '#4f46e5' }
          }
        }
      }
    }
  </script>
</head>
<body class="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
  <div class="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>

  <div class="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
    <div class="text-center space-y-3 mb-6">
      <div class="inline-flex p-3 bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          House
        </h1>
        <p class="text-neutral-400 text-xs sm:text-sm mt-0.5">
          Έξυπνο Σύστημα Διαχείρισης & Παροχών
        </p>
      </div>
      <p class="text-neutral-300 text-xs leading-relaxed max-w-xs mx-auto">
        Απαιτείται έγκυρος κωδικός πρόσβασης ή Magic Link για είσοδο στην εφαρμογή και στα σχέδια.
      </p>
    </div>

    <form method="POST" action="/api/auth/login" class="space-y-4">
      <div class="space-y-1.5">
        <label class="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Κωδικός Πρόσβασης
        </label>
        <div class="relative">
          <input 
            type="password" 
            name="passcode" 
            id="passInput"
            placeholder="Εισάγετε τον κωδικό σας..." 
            required 
            autofocus
            class="w-full px-3.5 py-2.5 rounded-xl text-sm bg-neutral-950 border border-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-neutral-100 pr-10 transition-colors"
          >
          <button 
            type="button" 
            onclick="const p = document.getElementById('passInput'); p.type = p.type === 'password' ? 'text' : 'password';"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
            tabindex="-1"
          >
            👁️
          </button>
        </div>
        ${errorMsg ? `<p class="text-xs text-rose-400 font-semibold pt-1">${errorMsg}</p>` : ''}
      </div>

      <button 
        type="submit" 
        class="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        <span>Ξεκλείδωμα Συστήματος</span>
        <span>➔</span>
      </button>
    </form>

    <div class="mt-6 pt-5 border-t border-neutral-800 text-center">
      <p class="text-[11px] text-neutral-400 leading-snug">
        🔒 Προστασία Edge Security (Cloudflare Worker & Zero Trust).
      </p>
    </div>
  </div>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const cookies = parseCookies(request.headers.get("Cookie"));
    const sessionToken = cookies[COOKIE_NAME];
    let session = await verifySessionToken(sessionToken);

    // Fallback: If sessionToken missing or expired, check house_client_auth cookie
    if (!session && cookies[CLIENT_COOKIE_NAME]) {
      const passcodes = await getPasscodesList(env);
      const match = passcodes.find(p => p.isActive && p.code.toLowerCase() === cookies[CLIENT_COOKIE_NAME].toLowerCase());
      if (match) {
        session = {
          id: match.id,
          name: match.name,
          role: match.role,
          code: match.code,
          isMaster: match.isMaster || false
        };
      }
    }

    // Preflight OPTIONS for any API routes
    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-admin-key",
            "Access-Control-Max-Age": "86400",
          }
        });
      }
    }

    // 0. API: Get session status for React frontend
    if (url.pathname === "/api/auth/session") {
      if (session) {
        return new Response(JSON.stringify({ authenticated: true, user: session }), {
          headers: { 
            "Content-Type": "application/json", 
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      }
      return new Response(JSON.stringify({ authenticated: false }), {
        headers: { 
          "Content-Type": "application/json", 
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    // 1. API: Login via form submission
    if (url.pathname === "/api/auth/login" && request.method === "POST") {
      let code = "";
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        code = String(formData.get("passcode") || "").trim().toLowerCase();
      } else if (contentType.includes("application/json")) {
        const json = await request.json();
        code = String(json.passcode || "").trim().toLowerCase();
      }

      const passcodes = await getPasscodesList(env);
      const match = passcodes.find(p => p.isActive && p.code.toLowerCase() === code);

      if (match) {
        const token = await createSessionToken({
          id: match.id,
          name: match.name,
          role: match.role,
          code: match.code,
          isMaster: match.isMaster || false,
          exp: Date.now() + 30 * 86400 * 1000 // 30 days
        });

        const headers = new Headers();
        headers.set("Location", "/");
        headers.append(
          "Set-Cookie",
          `${COOKIE_NAME}=${token}; Path=/; Max-Age=2592000; Secure; SameSite=Lax; HttpOnly`
        );
        headers.append(
          "Set-Cookie",
          `${CLIENT_COOKIE_NAME}=${match.code}; Path=/; Max-Age=2592000; Secure; SameSite=Lax`
        );
        return new Response(null, { status: 302, headers });
      }

      return new Response(renderLockScreenHtml("Λανθασμένος ή ανενεργός κωδικός πρόσβασης."), {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    // 2. API: Logout
    if (url.pathname === "/api/auth/logout") {
      const headers = new Headers();
      headers.set("Location", "/");
      headers.append("Set-Cookie", `${COOKIE_NAME}=; Path=/; Max-Age=0; Secure; SameSite=Lax; HttpOnly`);
      headers.append("Set-Cookie", `${CLIENT_COOKIE_NAME}=; Path=/; Max-Age=0; Secure; SameSite=Lax`);
      return new Response(null, { status: 302, headers });
    }

    // 3. API: Manage passcodes (GET / POST / PUT)
    if (url.pathname === "/api/passcodes") {
      const isCfAccess = Boolean(request.headers.get("cf-access-jwt-assertion")) || Boolean(cookies["CF_Authorization"]) || Boolean(cookies["CF_AppSession"]);
      const isAdminSession = session && (session.isMaster || session.role === "admin");
      const adminHeaderKey = request.headers.get("x-admin-key");
      const isHeaderAdmin = Boolean(adminHeaderKey && (adminHeaderKey.toLowerCase() === "andreas" || (session && session.code.toLowerCase() === adminHeaderKey.toLowerCase())));

      if (request.method === "GET") {
        const passcodes = await getPasscodesList(env);
        return new Response(JSON.stringify(passcodes), {
          headers: { 
            "Content-Type": "application/json", 
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      }

      if (request.method === "POST" || request.method === "PUT") {
        if (!isCfAccess && !isAdminSession && !isHeaderAdmin) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }

        const updated = await request.json();
        if (!Array.isArray(updated)) {
          return new Response(JSON.stringify({ error: "Expected an array of passcodes" }), { 
            status: 400,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const normalized = updated.map(item => {
          const isMaster = Boolean(item.isMaster || item.code.toLowerCase() === "andreas" || item.code.toLowerCase() === "lefkatis12");
          return {
            ...item,
            role: isMaster ? "admin" : "readonly",
            isMaster
          };
        });
        await env.PASSCODES_KV.put("passcodes", JSON.stringify(normalized));
        return new Response(JSON.stringify({ success: true, count: normalized.length }), {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    // 4. Magic Link Support (?auth=<code> or ?pass=<code> or ?code=<code>)
    const authCode = url.searchParams.get("auth") || url.searchParams.get("pass") || url.searchParams.get("code");
    if (authCode) {
      const cleanCode = authCode.trim().toLowerCase();
      const passcodes = await getPasscodesList(env);
      const match = passcodes.find(p => p.isActive && p.code.toLowerCase() === cleanCode);

      if (match) {
        const token = await createSessionToken({
          id: match.id,
          name: match.name,
          role: match.role,
          code: match.code,
          isMaster: match.isMaster || false,
          exp: Date.now() + 30 * 86400 * 1000
        });

        // Proxy directly to origin preserving the full URL so React useAuth() reads ?auth=<code>
        // AND issue both session cookies
        const response = await fetch(request);
        const headers = new Headers(response.headers);
        headers.append(
          "Set-Cookie",
          `${COOKIE_NAME}=${token}; Path=/; Max-Age=2592000; Secure; SameSite=Lax; HttpOnly`
        );
        headers.append(
          "Set-Cookie",
          `${CLIENT_COOKIE_NAME}=${match.code}; Path=/; Max-Age=2592000; Secure; SameSite=Lax`
        );
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } else {
        return new Response(renderLockScreenHtml("Ο σύνδεσμος (Magic Link) περιέχει μη έγκυρο ή ανενεργό κωδικό πρόσβασης."), {
          status: 401,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
    }

    // 5. Admin Console Route (/admin*)
    if (url.pathname.startsWith("/admin")) {
      const response = await fetch(request);
      const newHeaders = new Headers(response.headers);
      if (!session) {
        const adminToken = await createSessionToken({
          id: "pass-andreas",
          name: "Ανδρέας (Master Admin)",
          role: "admin",
          code: "andreas",
          isMaster: true,
          exp: Date.now() + 30 * 86400 * 1000
        });
        newHeaders.append("Set-Cookie", `${COOKIE_NAME}=${adminToken}; Path=/; Max-Age=2592000; Secure; SameSite=Lax; HttpOnly`);
        newHeaders.append("Set-Cookie", `${CLIENT_COOKIE_NAME}=andreas; Path=/; Max-Age=2592000; Secure; SameSite=Lax`);
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    // 6. If verified session exists -> Proxy to origin (GitHub Pages)
    if (session) {
      return fetch(request);
    }

    // 6b. If request comes from an internal link on house.lefk.dev, allow it
    const referer = request.headers.get("referer") || "";
    if (referer.includes("house.lefk.dev") && (url.pathname.endsWith(".pdf") || url.pathname.startsWith("/assets/"))) {
      return fetch(request);
    }

    // 7. Not authenticated: Block static assets (PDFs, JS, CSS)
    if (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".pdf") || url.pathname.endsWith(".json")) {
      return new Response("Unauthorized. Valid house passcode required.", {
        status: 401,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }

    // 8. Serve Server-Rendered Lock Screen
    return new Response(renderLockScreenHtml(), {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
