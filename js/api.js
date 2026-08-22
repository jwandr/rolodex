import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

let client = null;
export function getClient() {
  if (!client) {
    if (!window.supabase) {
      throw new Error('Supabase JS library did not load. Check your internet connection.');
    }
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

export function isConfigured() {
  return SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
         SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

// ---------- Trips ----------
export async function fetchTrip() {
  const { data, error } = await getClient().from('rolodex_trips').select('*').order('created_at').limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

// ---------- Destinations ----------
export async function fetchDestinations(tripId) {
  const { data, error } = await getClient()
    .from('rolodex_destinations')
    .select('*, rolodex_cards(count)')
    .eq('trip_id', tripId)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function fetchDestination(id) {
  const { data, error } = await getClient().from('rolodex_destinations').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createDestination(payload) {
  const { data, error } = await getClient().from('rolodex_destinations').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateDestination(id, patch) {
  const { data, error } = await getClient()
    .from('rolodex_destinations')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---------- Cards ----------
export async function fetchCards(destinationId) {
  const { data, error } = await getClient()
    .from('rolodex_cards')
    .select('*')
    .eq('destination_id', destinationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCard(payload) {
  const { data, error } = await getClient().from('rolodex_cards').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCard(id, patch) {
  const { data, error } = await getClient().from('rolodex_cards').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCard(id) {
  const { error } = await getClient().from('rolodex_cards').delete().eq('id', id);
  if (error) throw error;
}

export async function touchLastViewed(id) {
  // Best-effort, non-blocking — used for "haven't looked at recently"
  try {
    await getClient().from('rolodex_cards').update({ last_viewed_at: new Date().toISOString() }).eq('id', id);
  } catch (e) { /* ignore */ }
}
