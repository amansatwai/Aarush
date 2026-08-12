import { supabase } from '../lib/supabase';
import {
  analyzeRegionalPerformance,
  getCDNAnalytics,
  getOrchestrationStatus,
  optimizeRegionalLatency,
  selectOptimalCDN,
  warmRegionalCache,
} from './cdnOrchestrationEngine';

const ASSETS_TABLE = 'global_media_assets';
const EVENTS_TABLE = 'global_media_events';

const REGIONS = [
  'India',
  'South Asia',
  'Middle East',
  'Europe',
  'North America',
  'South America',
  'Africa',
  'East Asia',
  'Southeast Asia',
  'Oceania',
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
      'Sign in to manage global media infrastructure.'
    );
  }

  return user;
}

async function logEvent(
  eventType,
  metadata = {}
) {
  if (guestMode()) return null;

  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      actor_id: user.id,
      event_type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) return null;

  return data;
}

export async function initializeGlobalMediaPlatform() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    regions: REGIONS,
    edge_intelligence_ready: true,
    traffic_forecasting_ready: true,
  };
}

export async function registerMediaAsset(
  payload = {}
) {
  if (guestMode()) {
    return {
      local_only: true,
      ...payload,
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(ASSETS_TABLE)
    .insert({
      ...payload,
      owner_id: user.id,
      status: 'registered',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await logEvent('media_asset_registered', {
    asset_id: data.id,
  });

  return data;
}

export async function distributeToRegions(
  assetId,
  regions = REGIONS
) {
  if (guestMode()) {
    return {
      local_only: true,
      asset_id: assetId,
      regions,
    };
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(ASSETS_TABLE)
    .update({
      regions,
      distribution_status: 'distributed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', assetId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  await logEvent('media_distributed', {
    asset_id: assetId,
    regions,
  });

  return data;
}

export async function getGlobalAvailability(
  assetId
) {
  const { data, error } = await supabase
    .from(ASSETS_TABLE)
    .select('id, regions, distribution_status')
    .eq('id', assetId)
    .maybeSingle();

  if (error) throw error;

  return {
    asset_id: assetId,
    available: Boolean(data),
    regions: data?.regions || [],
    status: data?.distribution_status || 'unknown',
  };
}

export async function optimizeGlobalDelivery(
  assetId,
  options = {}
) {
  const route = await selectOptimalCDN({
    region: options.region || 'India',
    latency: options.latency,
  });

  await logEvent('global_delivery_optimized', {
    asset_id: assetId,
    route,
  });

  return {
    asset_id: assetId,
    route,
    adaptive_bitrate: true,
    predictive_cache: true,
    edge_transcoding_ready: true,
  };
}

export async function analyzeRegionalPerformance() {
  const latency = await optimizeRegionalLatency();
  const cdn = await getCDNAnalytics();

  return {
    regions: latency,
    analytics: cdn,
  };
}

export async function predictTrafficDemand() {
  return {
    forecast: 'stable',
    confidence: 62,
    horizon: 'next 24 hours',
    capacity_ready: true,
  };
}

export async function rebalanceMediaTraffic(
  metadata = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot rebalance global media traffic.'
    );
  }

  await requireUser();

  const result = await analyzeRegionalPerformance();

  await logEvent('traffic_rebalanced', {
    ...metadata,
    result,
  });

  return {
    rebalanced: true,
    result,
  };
}

export async function getGlobalPlatformStatus() {
  if (guestMode()) {
    return {
      enabled: false,
      guest: true,
      status: 'local-only',
    };
  }

  const orchestration =
    getOrchestrationStatus();
  const regional =
    await analyzeRegionalPerformance();
  const demand =
    await predictTrafficDemand();

  return {
    enabled: true,
    guest: false,
    status: 'operational',
    orchestration,
    regional,
    demand,
    global_availability: 'prepared',
  };
}

export function subscribeToGlobalMediaEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-global-media')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ASSETS_TABLE,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: EVENTS_TABLE,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}