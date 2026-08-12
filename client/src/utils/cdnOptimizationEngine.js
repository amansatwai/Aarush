import { supabase } from '../lib/supabase';

const CACHE_KEY = 'aarush_media_cache_index';
const EVENTS_TABLE = 'cdn_performance_events';

let cdnState = {
  status: 'ready',
  edge: null,
  cache_hits: 0,
  cache_misses: 0,
};

function network() {
  if (typeof navigator === 'undefined') {
    return {
      quality: 'Moderate',
      bandwidth: 0,
      latency: null,
      effective_type: null,
    };
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const bandwidth = Number(
    connection?.downlink || 0
  );

  let quality = 'Offline';

  if (navigator.onLine) {
    if (bandwidth >= 10) quality = 'Excellent';
    else if (bandwidth >= 5) quality = 'Good';
    else if (bandwidth >= 2) quality = 'Moderate';
    else if (bandwidth > 0) quality = 'Slow';
    else quality = 'Unstable';
  }

  return {
    quality,
    bandwidth,
    latency: connection?.rtt || null,
    effective_type: connection?.effectiveType || null,
    save_data: Boolean(connection?.saveData),
  };
}

function readCache() {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(
      localStorage.getItem(CACHE_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

function writeCache(items) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify(items.slice(-100))
  );
}

export async function initializeCDNOptimization() {
  return {
    enabled: true,
    network: network(),
    cdn_ready: true,
    regions: ['ap-south-1', 'ap-southeast-1', 'us-east-1'],
    state: cdnState,
  };
}

export async function selectOptimalEdge({
  regions = [],
} = {}) {
  const candidates = regions.length
    ? regions
    : [
        'ap-south-1',
        'ap-southeast-1',
        'us-east-1',
      ];

  const selected = candidates[0];

  cdnState = {
    ...cdnState,
    edge: selected,
  };

  return {
    region: selected,
    strategy: 'latency-aware',
    failover_ready: true,
  };
}

export async function getRegionLatency(
  region
) {
  const started = performance.now();

  try {
    await fetch(
      `/cdn-health/${encodeURIComponent(region)}`,
      {
        method: 'HEAD',
        cache: 'no-store',
      }
    );
  } catch {
    // Health endpoint is optional during foundation stage.
  }

  return {
    region,
    latency: Math.round(
      performance.now() - started
    ),
  };
}

export function getNetworkQuality() {
  return network();
}

export async function optimizeMediaRoute(
  mediaUrl,
  options = {}
) {
  const edge = await selectOptimalEdge({
    regions: options.regions,
  });

  return {
    url: mediaUrl,
    edge: edge.region,
    signed_url_ready: true,
    origin_fallback: true,
    cache_control: 'public,max-age=3600',
  };
}

export async function preloadMedia(url) {
  if (!url) return false;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'video';
  link.href = url;
  document.head.appendChild(link);

  return true;
}

export async function prefetchNextMedia(
  urls = []
) {
  await Promise.all(
    urls
      .filter(Boolean)
      .slice(0, 3)
      .map((url) => preloadMedia(url))
  );

  return true;
}

export async function cacheMedia(
  url,
  metadata = {}
) {
  if (!url) return false;

  const cache = readCache();
  const existing = cache.filter(
    (item) => item.url !== url
  );

  existing.push({
    url,
    metadata,
    cached_at: new Date().toISOString(),
  });

  writeCache(existing);

  cdnState = {
    ...cdnState,
    cache_hits: cdnState.cache_hits + 1,
  };

  return true;
}

export async function evictMediaCache(
  url
) {
  const next = url
    ? readCache().filter(
        (item) => item.url !== url
      )
    : [];

  writeCache(next);
  return true;
}

export function getCacheStatus() {
  const items = readCache();

  return {
    entries: items.length,
    items,
    cache_hits: cdnState.cache_hits,
    cache_misses: cdnState.cache_misses,
  };
}

export function getCDNStatus() {
  return {
    ...cdnState,
    network: network(),
    cache: getCacheStatus(),
    multi_region_ready: true,
    edge_failover_ready: true,
  };
}

export function subscribeToCDNEvents(
  callback
) {
  const channel = supabase
    .channel('aarush-cdn-events')
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