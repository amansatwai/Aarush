import { supabase } from '../lib/supabase';

const REGIONS_TABLE = 'infrastructure_regions';
const EVENTS_TABLE = 'scaling_events';

export const GLOBAL_REGIONS = [
  'India',
  'Singapore',
  'UAE',
  'Europe',
  'United Kingdom',
  'North America',
  'South America',
  'Africa',
  'East Asia',
  'Southeast Asia',
  'Australia',
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
      'Sign in to manage global infrastructure.'
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

export async function initializeGlobalScaling() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    regions: GLOBAL_REGIONS,
    weighted_routing_ready: true,
    latency_routing_ready: true,
    failover_ready: true,
  };
}

export async function registerRegion(
  region,
  metadata = {}
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot register regions.'
    );
  }

  if (!GLOBAL_REGIONS.includes(region)) {
    throw new Error('Unsupported infrastructure region.');
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(REGIONS_TABLE)
    .upsert(
      {
        name: region,
        owner_id: user.id,
        enabled: true,
        health: 'unknown',
        capacity: metadata.capacity || 0,
        latency: metadata.latency || null,
        traffic_percentage: 0,
        failover_ready: true,
        metadata,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'owner_id,name',
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function enableRegion(regionId) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(REGIONS_TABLE)
    .update({
      enabled: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', regionId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  await logEvent('region_enabled', {
    region_id: regionId,
  });

  return data;
}

export async function disableRegion(regionId) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(REGIONS_TABLE)
    .update({
      enabled: false,
      traffic_percentage: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', regionId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  await logEvent('region_disabled', {
    region_id: regionId,
  });

  return data;
}

export async function getRegions() {
  if (guestMode()) {
    return GLOBAL_REGIONS.map((name) => ({
      name,
      enabled: true,
      health: 'demo',
      capacity: 0,
      latency: null,
      traffic_percentage: 0,
      failover_ready: true,
    }));
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(REGIONS_TABLE)
    .select('*')
    .eq('owner_id', user.id)
    .order('name', {
      ascending: true,
    });

  if (error) throw error;

  return data || [];
}

export async function analyzeRegionalLoad() {
  const regions = await getRegions();

  return regions.map((region) => ({
    ...region,
    utilization: Number(
      region.utilization ||
        region.traffic_percentage ||
        0
    ),
    load_state:
      Number(region.utilization || 0) > 80
        ? 'high'
        : 'stable',
  }));
}

export async function predictCapacityDemand() {
  const regions = await analyzeRegionalLoad();

  const utilization = regions.map(
    (region) => region.utilization || 0
  );

  const average = utilization.length
    ? utilization.reduce(
        (total, value) => total + value,
        0
      ) / utilization.length
    : 0;

  return {
    users: 'forecast-ready',
    requests: 'forecast-ready',
    media_traffic: 'forecast-ready',
    api_traffic: 'forecast-ready',
    storage: 'forecast-ready',
    bandwidth: 'forecast-ready',
    streaming_sessions: 'forecast-ready',
    live_viewers: 'forecast-ready',
    creator_uploads: 'forecast-ready',
    business_operations: 'forecast-ready',
    average_utilization: average,
    trend: average > 70 ? 'increasing' : 'stable',
  };
}

export async function rebalanceGlobalTraffic(
  strategy = 'latency'
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot rebalance global traffic.'
    );
  }

  await requireUser();

  const regions = await analyzeRegionalLoad();
  const enabled = regions.filter(
    (region) => region.enabled
  );

  const percentage = enabled.length
    ? 100 / enabled.length
    : 0;

  for (const region of enabled) {
    await supabase
      .from(REGIONS_TABLE)
      .update({
        traffic_percentage: percentage,
        routing_strategy: strategy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', region.id);
  }

  await logEvent('traffic_rebalanced', {
    strategy,
    regions: enabled.length,
  });

  return {
    strategy,
    regions: enabled.length,
    traffic_percentage: percentage,
  };
}

export async function triggerRegionalFailover(
  regionId,
  reason = 'manual'
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot trigger regional failover.'
    );
  }

  const user = await requireUser();

  const { data, error } = await supabase
    .from(REGIONS_TABLE)
    .update({
      health: 'failover',
      enabled: false,
      traffic_percentage: 0,
      failover_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', regionId)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) throw error;

  await logEvent('regional_failover', {
    region_id: regionId,
    reason,
  });

  return data;
}

export async function getGlobalHealth() {
  const regions = await analyzeRegionalLoad();

  return {
    state: regions.some(
      (region) => region.health === 'unhealthy'
    )
      ? 'degraded'
      : 'healthy',
    regions,
  };
}

export async function getScalingStatus() {
  const [
    health,
    demand,
    regions,
  ] = await Promise.all([
    getGlobalHealth(),
    predictCapacityDemand(),
    getRegions(),
  ]);

  return {
    status: health.state,
    regions,
    health,
    demand,
    multi_region: true,
    disaster_recovery: true,
  };
}

export function subscribeToScalingEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-global-scaling')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: REGIONS_TABLE,
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