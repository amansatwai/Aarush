import { supabase } from '../lib/supabase';

const LISTINGS_TABLE = 'marketplace_listings';
const SAVED_TABLE = 'saved_listings';

export const LISTING_TYPES = [
  'Physical Product',
  'Digital Product',
  'Service',
  'Subscription',
  'Event',
  'Course',
  'Download',
  'Consultation',
];

export const MARKETPLACE_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Beauty',
  'Home',
  'Books',
  'Education',
  'Digital',
  'Services',
  'Art',
  'Music',
  'Gaming',
  'Other',
];

function guestMode() {
  if (typeof window === 'undefined') return false;

  return (
    window.localStorage.getItem(
      'aarush_is_guest'
    ) === 'true' &&
    window.localStorage.getItem(
      'aarush_guest_session'
    ) === 'active'
  );
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error(
      'Sign in to manage marketplace listings.'
    );
  }

  return user;
}

export async function initializeMarketplace() {
  return {
    enabled: true,
    guest: guestMode(),
    listing_types: LISTING_TYPES,
    categories: MARKETPLACE_CATEGORIES,
  };
}

export async function createListing(payload) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create marketplace listings.'
    );
  }

  const user = await requireUser();

  if (!payload?.title || !payload?.listing_type) {
    throw new Error(
      'Listing title and type are required.'
    );
  }

  if (!LISTING_TYPES.includes(payload.listing_type)) {
    throw new Error('Unsupported listing type.');
  }

  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .insert({
      ...payload,
      seller_id: user.id,
      status: payload.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateListing(
  listingId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('seller_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteListing(listingId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(LISTINGS_TABLE)
    .delete()
    .eq('id', listingId)
    .eq('seller_id', user.id);

  if (error) throw error;

  return true;
}

export async function getListing(listingId) {
  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .select(`
      *,
      profiles!marketplace_listings_seller_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('id', listingId)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function getListings({
  page = 0,
  pageSize = 24,
  category,
  listingType,
  sellerId,
  status = 'published',
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(LISTINGS_TABLE)
    .select(`
      *,
      profiles!marketplace_listings_seller_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('status', status)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (category) {
    query = query.eq('category', category);
  }

  if (listingType) {
    query = query.eq(
      'listing_type',
      listingType
    );
  }

  if (sellerId) {
    query = query.eq('seller_id', sellerId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    items: data || [],
    page,
    pageSize,
    hasMore: (data || []).length === pageSize,
  };
}

export async function searchListings(
  search,
  options = {}
) {
  const term = String(search || '').trim();

  if (!term) {
    return getListings(options);
  }

  const from = (options.page || 0) * (options.pageSize || 24);
  const to = from + (options.pageSize || 24) - 1;

  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .select(`
      *,
      profiles!marketplace_listings_seller_id_fkey (
        id,
        username,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq('status', 'published')
    .or(
      `title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`
    )
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return {
    items: data || [],
    page: options.page || 0,
    pageSize: options.pageSize || 24,
    hasMore: (data || []).length === (options.pageSize || 24),
  };
}

export async function filterListings(filters = {}) {
  return getListings(filters);
}

export async function saveListing(listingId) {
  if (guestMode()) {
    throw new Error(
      'Sign in to save marketplace listings.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(SAVED_TABLE)
    .upsert(
      {
        user_id: user.id,
        listing_id: listingId,
        created_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,listing_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function unsaveListing(listingId) {
  const user = await requireUser();

  const { error } = await supabase
    .from(SAVED_TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId);

  if (error) throw error;

  return true;
}

export async function getSavedListings({
  page = 0,
  pageSize = 24,
} = {}) {
  if (guestMode()) return [];

  const user = await requireUser();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from(SAVED_TABLE)
    .select(`
      id,
      listing_id,
      created_at,
      marketplace_listings (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', {
      ascending: false,
    })
    .range(from, to);

  if (error) throw error;

  return data || [];
}

export async function getMarketplaceStatus() {
  const { count, error } = await supabase
    .from(LISTINGS_TABLE)
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('status', 'published');

  if (error) throw error;

  return {
    enabled: true,
    published_listings: count || 0,
    categories: MARKETPLACE_CATEGORIES,
  };
}

export function subscribeToMarketplace(
  callback
) {
  const channel = supabase
    .channel('aarush-marketplace')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: LISTINGS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SAVED_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}