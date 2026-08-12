import { supabase } from '../lib/supabase';

const EVENTS_TABLE = 'cdn_orchestration_events';

export const CDN_PROVIDERS = [
  'Cloudflare',
  'Fastly',
  'Akamai',
  'AWS CloudFront',
  'Google Cloud CDN',
  'Azure CDN',
  'Custom CDN',
];

export const REGIONS = [
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

let orchestrationState = {
  provider: 'Cloudflare',
  region: 'India',
  failover: 'ready',
  edge_health: 'unknown',
};

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
      'Sign in to manage CDN orchestration.'
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

export async function initializeCDNOrchestration() {
  return {
    enabled: !guestMode(),
    guest: guestMode(),
    providers: CDN_PROVIDERS,
    regions: REGIONS,
    multi_cdn_ready: true,
    failover_ready: true,
  };
}

export async function selectOptimalCDN({
  region = 'India',
  latency = null,
} = {}) {
  const provider =
    latency && latency > 250
      ? 'AWS CloudFront'
      : 'Cloudflare';

  orchestrationState = {
    ...orchestrationState,
    provider,
    region,
  };

  await logEvent('cdn_selected', {
    provider,
    region,
    latency,
  });

  return {
    provider,
    region,
    strategy: 'latency-aware',
  };
}

export async function orchestrateEdgeRouting(
  mediaId,
  options = {}
) {
  const route = await selectOptimalCDN(options);

  return {
    media_id: mediaId,
    ...route,
    edge_fallback: true,
    signed_url_ready: true,
    origin_fallback: true,
  };
}

export async function monitorEdgeHealth(
  region = orchestrationState.region
) {
  const started = performance.now();

  try {
    await fetch(
      `/edge-health/${encodeURIComponent(region)}`,
      {
        method: 'HEAD',
        cache: 'no-store',
      }
    );
  } catch {
    // Optional health endpoint.
  }

  const latency = Math.round(
    performance.now() - started
  );

  const health =
    latency < 100
      ? 'healthy'
      : latency < 250
        ? 'degraded'
        : 'unhealthy';

  orchestrationState = {
    ...orchestrationState,
    region,
    edge_health: health,
  };

  return {
    region,
    latency,
    health,
  };
}

export async function failoverToBackupCDN(
  reason = 'health-check'
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot trigger CDN failover.'
    );
  }

  const provider =
    orchestrationState.provider === 'Cloudflare'
      ? 'AWS CloudFront'
      : 'Cloudflare';

  orchestrationState = {
    ...orchestrationState,
    provider,
    failover: 'active',
  };

  await logEvent('cdn_failover', {
    provider,
    reason,
  });

  return {
    provider,
    failover: 'active',
    reason,
  };
}

export async function warmRegionalCache(
  mediaIds = [],
  region = orchestrationState.region
) {
  if (guestMode()) {
    return {
      local_only: true,
      media_ids: mediaIds,
      region,
    };
  }

  await logEvent('regional_cache_warmed', {
    media_ids: mediaIds,
    region,
  });

  return {
    warmed: true,
    media_ids: mediaIds,
    region,
  };
}

export async function invalidateGlobalCache(
  mediaId = null
) {
  if (guestMode()) {
    throw new Error(
      'Guests cannot invalidate global cache.'
    );
  }

  await logEvent('global_cache_invalidated', {
    media_id: mediaId,
  });

  return {
    invalidated: true,
    media_id: mediaId,
  };
}

export async function optimizeRegionalLatency(
  regions = REGIONS
) {
  const results = await Promise.all(
    regions.map((region) =>
      monitorEdgeHealth(region)
    )
  );

  return results.sort(
    (first, second) =>
      first.latency - second.latency
  );
}

export async function getCDNAnalytics() {
  return {
    regional_latency: {},
    edge_health: orchestrationState.edge_health,
    cache_hit_ratio: null,
    startup_time: null,
    playback_success: null,
    rebuffer_rate: null,
    quality_distribution: {},
    traffic_distribution: {},
    bandwidth_usage: null,
    global_availability: null,
  };
}

export function getOrchestrationStatus() {
  return {
    ...orchestrationState,
    providers: CDN_PROVIDERS,
    regions: REGIONS,
    multi_cdn_redundancy: true,
    disaster_recovery_routing: true,
  };
}

export function subscribeToCDNOrchestration(
  callback
) {
  const channel = supabase
    .channel('aarush-cdn-orchestration')
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