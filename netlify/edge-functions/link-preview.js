/**
 * Netlify Edge Function: link previews for shared materials and courses.
 *
 * Social crawlers (Discord, Facebook, Viber, Telegram…) do not run JavaScript, so on the SPA they would
 * only see the generic tags from index.html. For crawler requests to /materials/:id and /courses/:id this
 * function loads the title and description from Supabase (public data, readable by guests under RLS)
 * and rewrites the Open Graph tags. Regular visitors pass through untouched (no extra latency).
 *
 * Env (already set for the Vite build): VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY — public values.
 */

const CRAWLERS = /bot|crawler|spider|facebookexternalhit|facebookcatalog|discord|twitter|slack|telegram|whatsapp|viber|linkedin|skype|embedly|pinterest|vkshare|redditbot|applebot|google-inspectiontool/i;
const ROUTE = /^\/(materials|courses)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i;

const escapeAttr = (text) => String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Share texts use the en dash: "Пробен изпит – Programming Basics – StudyShare". */
const dash = (text) => String(text).replace(/\s+—\s+/g, ' – ');
const shorten = (text, max) => {
  const clean = dash(String(text ?? '').replace(/\s+/g, ' ').trim());
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

async function loadPreview(kind, id) {
  const base = Netlify.env.get('VITE_SUPABASE_URL');
  const key = Netlify.env.get('VITE_SUPABASE_PUBLISHABLE_KEY');
  if (!base || !key) return null;

  const select = kind === 'materials'
    ? 'title,description,course:courses(title),author:profiles!materials_author_id_fkey(full_name)'
    : 'title,description';
  const url = `${base}/rest/v1/${kind}?id=eq.${id}&select=${encodeURIComponent(select)}&limit=1`;
  const response = await fetch(url, { headers: { apikey: key }, signal: AbortSignal.timeout(2500) });
  if (!response.ok) return null;
  const [row] = await response.json();
  if (!row) return null;

  if (kind === 'materials') {
    const by = [row.course?.title && `Курс: ${row.course.title}`, row.author?.full_name && `Автор: ${row.author.full_name}`].filter(Boolean).join(' · ');
    return {
      title: dash(`${row.title} – StudyShare`),
      description: shorten([row.description, by].filter(Boolean).join(' – '), 200),
      type: 'article',
    };
  }
  return {
    title: dash(`${row.title} – курс в StudyShare`),
    description: shorten(row.description || 'Учебни материали по курса, споделени от студенти.', 200),
    type: 'website',
  };
}

export default async (request, context) => {
  const url = new URL(request.url);
  const match = url.pathname.match(ROUTE);
  if (!match || !CRAWLERS.test(request.headers.get('user-agent') ?? '')) return; // continue normally

  const response = await context.next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;

  let preview;
  try {
    preview = await loadPreview(match[1].toLowerCase(), match[2].toLowerCase());
  } catch {
    preview = null; // Supabase slow or down → keep the generic tags
  }
  if (!preview) return response;

  const pageUrl = `${url.origin}${url.pathname}`;
  const tags = {
    'og:title': preview.title,
    'og:description': preview.description,
    'og:type': preview.type,
    'og:url': pageUrl,
    'og:image': `${url.origin}/og-image.png`,
  };

  // Replacer functions, so "$" in user text is never treated as a replacement pattern
  const setContent = (source, pattern, value) => source.replace(pattern, (_, start, end) => `${start}${escapeAttr(value)}${end}`);
  let html = await response.text();
  html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeAttr(preview.title)}</title>`);
  html = setContent(html, /(<meta name="description" content=")[^"]*(")/, preview.description);
  for (const [property, value] of Object.entries(tags)) {
    html = setContent(html, new RegExp(`(<meta property="${property}" content=")[^"]*(")`), value);
  }
  const twitter = { 'twitter:title': tags['og:title'], 'twitter:description': tags['og:description'], 'twitter:image': tags['og:image'] };
  for (const [name, value] of Object.entries(twitter)) {
    html = setContent(html, new RegExp(`(<meta name="${name}" content=")[^"]*(")`), value);
  }

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('cache-control', 'public, max-age=0, must-revalidate');
  return new Response(html, { status: response.status, headers });
};

export const config = {
  path: ['/materials/*', '/courses/*'],
  excludedPath: ['/materials/add', '/materials/*/edit'],
};
