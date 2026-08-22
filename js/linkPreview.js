import { MICROLINK_KEY } from './config.js';

// Uses microlink.io's free, CORS-enabled metadata API to pull
// title/description/image/source from an arbitrary URL. No server
// of our own required. Free tier is rate-limited but fine for
// personal use; add MICROLINK_KEY in config.js if you hit limits.
export async function fetchLinkPreview(url) {
  const endpoint = new URL('https://api.microlink.io/');
  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('palette', 'false');
  if (MICROLINK_KEY) endpoint.searchParams.set('key', MICROLINK_KEY);

  const res = await fetch(endpoint.toString());
  if (!res.ok) throw new Error(`Preview fetch failed (${res.status})`);
  const json = await res.json();
  if (json.status !== 'success') throw new Error('Could not read that page');

  const d = json.data;
  let source = '';
  try { source = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { /* ignore */ }

  return {
    title: d.title || source || url,
    description: d.description || '',
    image: d.image?.url || d.logo?.url || null,
    source,
  };
}
