import { supabase } from '../lib/supabase';

const BUSINESS_TABLE = 'business_accounts';
const STOREFRONTS_TABLE = 'storefronts';

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
      'Sign in to manage business features.'
    );
  }

  return user;
}

export async function createBusinessAccount(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create business accounts.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .insert({
      user_id: user.id,
      account_type: payload.account_type || 'business',
      business_name:
        payload.business_name || null,
      bio: payload.bio || null,
      category: payload.category || null,
      contact_email: payload.contact_email || user.email,
      status: 'active',
      verified: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function upgradeToBusiness(
  payload = {}
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .upsert(
      {
        user_id: user.id,
        account_type: 'business',
        status: 'active',
        ...payload,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function downgradeBusinessAccount() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .update({
      account_type: 'personal',
      status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getBusinessProfile(
  userId
) {
  const id = userId || (await requireUser()).id;

  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .select('*')
    .eq('user_id', id)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function updateBusinessProfile(
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(BUSINESS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getStorefront(userId) {
  const id = userId || (await requireUser()).id;

  const { data, error } = await supabase
    .from(STOREFRONTS_TABLE)
    .select('*')
    .eq('owner_id', id)
    .maybeSingle();

  if (error) throw error;

  return data || null;
}

export async function createStorefront(
  payload = {}
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(STOREFRONTS_TABLE)
    .insert({
      ...payload,
      owner_id: user.id,
      status: 'active',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateStorefront(
  storefrontId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(STOREFRONTS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', storefrontId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getBusinessStatus() {
  if (guestMode()) {
    return {
      enabled: false,
      guest: true,
      account_type: 'personal',
    };
  }

  const profile = await getBusinessProfile();

  return {
    enabled: Boolean(profile),
    guest: false,
    account_type:
      profile?.account_type || 'personal',
    verified: Boolean(profile?.verified),
    status: profile?.status || 'inactive',
  };
}

export async function getCreatorStatus() {
  if (guestMode()) {
    return {
      enabled: false,
      guest: true,
    };
  }

  const user = await requireUser();
  const { data, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  return {
    enabled: Boolean(data),
    verified: Boolean(data?.verified),
    monetization_ready: Boolean(
      data?.monetization_ready
    ),
    profile: data || null,
  };
}

export function subscribeToBusinessChanges(
  callback
) {
  const channel = supabase
    .channel('aarush-business-marketplace')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: BUSINESS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: STOREFRONTS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}