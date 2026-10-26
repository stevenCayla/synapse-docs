// Password gate for the acceptance-test pages (/recette/* and /en/recette/*).
// Every other path is served directly from the static assets without running this
// script (see "run_worker_first" in wrangler.jsonc). The password is the Worker
// secret RECETTE_PASSWORD (wrangler secret put RECETTE_PASSWORD); any user name is
// accepted. Without the secret, the pages stay closed.

const encoder = new TextEncoder();

// Compares two strings in constant time by comparing their SHA-256 digests.
async function sameSecret(given, expected) {
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(given)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

// Password of an "Authorization: Basic ..." header, or null.
function passwordOf(header) {
  const match = /^Basic\s+(\S+)$/i.exec(header ?? '');
  if (!match) return null;
  try {
    const bytes = Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0));
    const text = new TextDecoder().decode(bytes);
    return text.slice(text.indexOf(':') + 1);
  } catch {
    return null;
  }
}

const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'private, no-store',
};

function refuse(status, message, extra = {}) {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY, ...extra },
  });
}

export default {
  async fetch(request, env) {
    const secret = env.RECETTE_PASSWORD;
    if (!secret) return refuse(503, 'Acceptance-test pages are not available.');

    const given = passwordOf(request.headers.get('Authorization'));
    if (given === null || !(await sameSecret(given, secret))) {
      return refuse(401, 'Authentication required.', {
        'WWW-Authenticate': 'Basic realm="Acceptance tests", charset="UTF-8"',
      });
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'private, max-age=0, must-revalidate, no-transform');
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
