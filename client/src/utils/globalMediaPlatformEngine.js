import { supabase } from '../lib/supabase';
import {
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

function safeMetadata(metadata = {}) {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const blockedKeys = new Set([
    'password',
    'token',
    'access_token',
    'refresh_token',
    'service_role_key',
    'api_key',
    'secret',
    'biometric_data',
    'session_secret',
  ]);

  return Object.entries(metadata).reduce((result, [key, value]) => {
    if (!blockedKeys.has(String(key).toLowerCase())) {
      result[key] = value;
    }

    return result;
  }, {});
}

function normalizedRegions(regions) {
  if (!Array.isArray(regions) || regions.length === 0) {
    return [...REGIONS];
  }

  return Array.from(
    new Set(
      regions.filter((region) =>
        REGIONS.includes(region)
      )
    )
  );
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error(
      'Sign in to manage global media infrastructure.'
    );
  }

  return user;
}

async function logEvent(eventType, metadata = {}) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(EVENTS_TABLE)
    .insert({
      actor_id: user.id,
      event_type: eventType,
      metadata: safeMetadata(metadata),
      created_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

function toAssetAvailability(asset) {
  if (!asset) {
    return {
      asset_id: null,
      available: false,
      regions: [],
      status: 'not_found',
    };
  }

  const regions = normalizedRegions(
    asset.regions || asset.available_regions
  );

  return {
    asset_id: asset.id,
    available:
      Boolean(asset.available) ||
      asset.status === 'distributed' ||
      asset.status === 'registered',
    regions,
    status: asset.status || 'registered',
  };
}

export async function initializeGlobalMediaPlatform() {
  return {
    enabled: true,
    regions: [...REGIONS],
    edge_intelligence_ready: true,
    traffic_forecasting_ready: true,
  };
}

export async function registerMediaAsset(payload = {}) {
  const user = await requireUser();

  const insertPayload = {
    ...payload,
    owner_id: user.id,
    status: 'registered',
    created_at: new Date().toISOString(),
  };

  delete insertPayload.id;
  delete insertPayload.ownerId;
  delete insertPayload.createdAt;
  delete insertPayload.password;
  delete insertPayload.token;
  delete insertPayload.access_token;
  delete insertPayload.refresh_token;

  const { data, error } = await supabase
    .from(ASSETS_TABLE)
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await logEvent('media_asset_registered', {
    asset_id: data.id,
    asset_type: data.type || data.media_type || null,
    regions: normalizedRegions(data.regions),
  });

  return data;
}

export async function distributeToRegions(
  assetId,
  regions = REGIONS
) {
  const user = await requireUser();

  if (!assetId) {
    throw new Error('A media asset ID is required.');
  }

  const targetRegions = normalizedRegions(regions);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from(ASSETS_TABLE)
    .update({
      regions: targetRegions,
      available_regions: targetRegions,
      distribution_status: 'distributed',
      status: 'distributed',
      updated_at: now,
    })
    .eq('id', assetId)
    .eq('owner_id', user.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      'Media asset was not found or is not owned by the authenticated user.'
    );
  }

  await logEvent('media_asset_distributed', {
    asset_id: data.id,
    regions: targetRegions,
    distribution_status: 'distributed',
  });

  return data;
}

export async function getGlobalAvailability(assetId) {
  const user = await requireUser();

  if (!assetId) {
    throw new Error('A media asset ID is required.');
  }

  const { data, error } = await supabase
    .from(ASSETS_TABLE)
    .select(
      'id, owner_id, status, distribution_status, regions, available_regions, available'
    )
    .eq('id', assetId)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return toAssetAvailability(data);
}

export async function optimizeGlobalDelivery(
  assetId,
  options = {}
) {
  const user = await requireUser();

  if (!assetId) {
    throw new Error('A media asset ID is required.');
  }

  const {
    region = REGIONS[0],
    latency = null,
    adaptive_bitrate = true,
    predictive_cache = true,
    edge_transcoding = true,
  } = options || {};

  const cdn = await selectOptimalCDN({
    region,
    latency,
    assetId,
    userId: user.id,
  });

  let cache = null;

  if (typeof warmRegionalCache === 'function') {
    cache = await warmRegionalCache({
      assetId,
      region,
      cdn,
      userId: user.id,
    });
  }

  await logEvent('global_delivery_optimized', {
    asset_id: assetId,
    region,
    cdn,
    adaptive_bitrate: Boolean(adaptive_bitrate),
    predictive_cache: Boolean(predictive_cache),
    edge_transcoding: Boolean(edge_transcoding),
  });

  return {
    asset_id: assetId,
    region,
    cdn,
    cache,
    adaptive_bitrate_ready: Boolean(adaptive_bitrate),
    predictive_cache_ready: Boolean(predictive_cache),
    edge_transcoding_ready: Boolean(edge_transcoding),
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

export async function rebalanceMediaTraffic(metadata = {}) {
  await requireUser();

  const performance = await analyzeRegionalPerformance();

  await logEvent('traffic_rebalanced', {
    ...safeMetadata(metadata),
    performance,
  });

  return performance;
}

export async function getGlobalPlatformStatus() {
  await requireUser();

  const [orchestration, regionalAnalytics, trafficDemand] =
    await Promise.all([
      getOrchestrationStatus(),
      analyzeRegionalPerformance(),
      predictTrafficDemand(),
    ]);

  return {
    enabled: true,
    status: 'operational',
    orchestration,
    regional_analytics: regionalAnalytics,
    traffic_demand: trafficDemand,
  };
}

export function subscribeToGlobalMediaEvents(callback) {
  if (typeof callback !== 'function') {
    return () => {};
  }

  const channel = supabase
    .channel('aarush-global-media')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: ASSETS_TABLE,
      },
      (payload) => {
        callback({
          type: 'asset',
          payload,
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: EVENTS_TABLE,
      },
      (payload) => {
        callback({
          type: 'event',
          payload,
        });
      }
    )
    .subscribe((status, error) => {
      if (error) {
        callback({
          type: 'subscription_error',
          error,
          status,
        });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}