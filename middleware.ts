// Vercel Routing Middleware: só quem está logado recebe as páginas e os scripts do portal.
// Livres: a tela de login, a pasta assets (logo e estilo) e a API (que confere a sessão sozinha).
export const config = { matcher: ['/((?!api/|login\\.html|assets/|favicon).*)'] };

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function sessaoValida(token: string, segredo: string | undefined) {
  const [h, p, s] = String(token || '').split('.');
  if (!h || !p || !s || !segredo) return false;
  const chave = await crypto.subtle.importKey('raw', enc.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = b64url(await crypto.subtle.sign('HMAC', chave, enc.encode(h + '.' + p)));
  if (sig.length !== s.length) return false;
  let dif = 0;
  for (let i = 0; i < sig.length; i++) dif |= sig.charCodeAt(i) ^ s.charCodeAt(i);
  if (dif) return false;
  try {
    const pl = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    return !!pl.exp && pl.exp * 1000 > Date.now();
  } catch (e) { return false; }
}

export default async function middleware(request: Request) {
  const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)fat_sessao=([^;]+)/);
  if (m && (await sessaoValida(decodeURIComponent(m[1]), process.env.JWT_SECRET))) return; // segue para a página
  return Response.redirect(new URL('/login.html', request.url), 302);
}
