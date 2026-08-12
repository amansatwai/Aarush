import { supabase } from '../lib/supabase';

const TIERS_TABLE = 'subscription_tiers';
const SUBSCRIPTIONS_TABLE = 'creator_subscriptions';
const REVENUE_TABLE = 'creator_revenue';
const PAYOUTS_TABLE = 'creator_payouts';

export const SUBSCRIPTION_TIER_TYPES = [
  'Free',
  'Supporter',
  'Premium',
  'VIP',
  'Custom Tier',
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
      'Sign in to manage monetization.'
    );
  }

  return user;
}

export async function initializeMonetization() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    tier_types: SUBSCRIPTION_TIER_TYPES,
    payout_ready: !guestMode(),
  };
}

export async function createSubscriptionTier(
  payload = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot create subscription tiers.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(TIERS_TABLE)
    .insert({
      creator_id: user.id,
      name: payload.name || 'Supporter',
      tier_type: payload.tier_type || 'Supporter',
      monthly_price: payload.monthly_price || 0,
      yearly_price: payload.yearly_price || 0,
      benefits: payload.benefits || {
        exclusive_content: false,
        badges: false,
        priority_messaging: false,
        early_access: false,
        download_access: false,
        community_access: false,
      },
      active: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateSubscriptionTier(
  tierId,
  patch
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(TIERS_TABLE)
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tierId)
    .eq('creator_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteSubscriptionTier(
  tierId
) {
  const user = await requireUser();

  const { error } = await supabase
    .from(TIERS_TABLE)
    .delete()
    .eq('id', tierId)
    .eq('creator_id', user.id);

  if (error) throw error;

  return true;
}

export async function getSubscriptionTiers(
  creatorId
) {
  const id = creatorId || (await requireUser()).id;

  const { data, error } = await supabase
    .from(TIERS_TABLE)
    .select('*')
    .eq('creator_id', id)
    .eq('active', true)
    .order('monthly_price', {
      ascending: true,
    });

  if (error) throw error;

  return data || [];
}

export async function subscribeToCreator(
  creatorId,
  tierId
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot subscribe to creators.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .upsert(
      {
        subscriber_id: user.id,
        creator_id: creatorId,
        tier_id: tierId,
        status: 'pending',
        started_at: new Date().toISOString(),
      },
      {
        onConflict: 'subscriber_id,creator_id',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function cancelSubscription(
  subscriptionId
) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .eq('subscriber_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getActiveSubscriptions() {
  if (guestMode()) return [];

  const user = await requireUser();

  const { data, error } = await supabase
    .from(SUBSCRIPTIONS_TABLE)
    .select('*')
    .or(
      `subscriber_id.eq.${user.id},creator_id.eq.${user.id}`
    )
    .eq('status', 'active')
    .order('started_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function getRevenueOverview() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(REVENUE_TABLE)
    .select('*')
    .eq('creator_id', user.id);

  if (error) throw error;

  const rows = data || [];

  const gross = rows.reduce(
    (sum, item) =>
      sum + Number(item.gross_amount || 0),
    0
  );

  const fees = rows.reduce(
    (sum, item) =>
      sum + Number(item.platform_fee || 0),
    0
  );

  return {
    gross,
    platform_fees: fees,
    net: gross - fees,
    subscriptions: rows
      .filter(
        (item) => item.revenue_type === 'subscription'
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.net_amount || 0),
        0
      ),
    products: rows
      .filter(
        (item) => item.revenue_type === 'product'
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.net_amount || 0),
        0
      ),
  };
}

export async function getMonthlyRevenue(
  months = 12
) {
  const overview = await getRevenueOverview();

  return {
    months,
    overview,
    series: [],
  };
}

export async function getPayoutHistory() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(PAYOUTS_TABLE)
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
}

export async function requestPayout(
  amount,
  metadata = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot request payouts.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(PAYOUTS_TABLE)
    .insert({
      creator_id: user.id,
      amount,
      status: 'requested',
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export function calculateCreatorRevenue({
  gross = 0,
  platformRate = 0.1,
  processingRate = 0.02,
} = {}) {
  const platformFee = gross * platformRate;
  const processingFee = gross * processingRate;

  return {
    gross,
    platform_fee: platformFee,
    processing_fee: processingFee,
    net: gross - platformFee - processingFee,
  };
}

export function subscribeToMonetization(
  callback
) {
  const channel = supabase
    .channel('aarush-monetization')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TIERS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SUBSCRIPTIONS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: REVENUE_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
export const currencies = {
  INR: { code: "INR", symbol: "₹", locale: "en-IN" },
  USD: { code: "USD", symbol: "$", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", locale: "en-GB" },
};

export function formatMoney(amount = 0, currency = "INR") {
  const meta = currencies[currency] || currencies.INR;

  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency: meta.code,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  } catch {
    return `${meta.symbol}${Number(amount || 0).toFixed(0)}`;
  }
}

export async function getMonetizationState() {
  if (guestMode()) {
    return {
      enabled: false,
      guest: true,
      currency: "INR",
      tiers: [],
      revenue: {
        gross: 0,
        platform_fees: 0,
        net: 0,
        subscriptions: 0,
        products: 0,
      },
      payout_ready: false,
    };
  }

  const tiers = await getSubscriptionTiers().catch(() => []);
  const revenue = await getRevenueOverview().catch(() => ({
    gross: 0,
    platform_fees: 0,
    net: 0,
    subscriptions: 0,
    products: 0,
  }));

  return {
    enabled: true,
    guest: false,
    currency: "INR",
    tiers,
    revenue,
    payout_ready: true,
  };
}

export async function getRevenueBreakdown() {
  const overview = await getRevenueOverview().catch(() => ({
    gross: 0,
    platform_fees: 0,
    net: 0,
    subscriptions: 0,
    products: 0,
  }));

  return {
    currency: "INR",
    gross: overview.gross,
    platform_fees: overview.platform_fees,
    processing_fees: 0,
    net: overview.net,
    subscriptions: overview.subscriptions,
    products: overview.products,
  };
}

export async function togglePaidFeature(featureKey, enabled) {
  return {
    feature: featureKey,
    enabled: Boolean(enabled),
    updated_at: new Date().toISOString(),
  };
}

export async function updateMonetizationState(patch = {}) {
  const current = await getMonetizationState();
  return {
    ...current,
    ...patch,
    updated_at: new Date().toISOString(),
  };
}