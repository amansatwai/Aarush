const FINGERPRINT_KEY =
  'aarush_trusted_session_fingerprint';

function getBrowser() {
  const ua = navigator.userAgent || '';

  if (/Edg\//i.test(ua)) return 'Edge';
  if (/Chrome\//i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari\//i.test(ua)) return 'Safari';

  return 'Unknown';
}

function getBrowserVersion() {
  const ua = navigator.userAgent || '';
  const match = ua.match(
    /(Edg|Chrome|Firefox|Version)\/([\d.]+)/
  );

  return match?.[2] || 'Unknown';
}

function getOperatingSystem() {
  const ua = navigator.userAgent || '';

  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS/i.test(ua)) return 'macOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad/i.test(ua)) return 'iOS';
  if (/Linux/i.test(ua)) return 'Linux';

  return 'Unknown';
}

export function generateSessionFingerprint() {
  if (typeof window === 'undefined') {
    return null;
  }

  return {
    browser: getBrowser(),
    browser_version: getBrowserVersion(),
    operating_system: getOperatingSystem(),
    timezone:
      Intl.DateTimeFormat().resolvedOptions()
        .timeZone || 'Unknown',
    language: navigator.language || 'Unknown',
    screen_resolution: `${window.screen?.width || 0}x${
      window.screen?.height || 0
    }`,
    color_depth: window.screen?.colorDepth || 0,
    platform: navigator.platform || 'Unknown',
    hardware_concurrency:
      navigator.hardwareConcurrency || null,
    device_memory: navigator.deviceMemory || null,
    touch_capability:
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0,
    created_at: new Date().toISOString(),
  };
}

export function fingerprintSimilarity(
  first,
  second
) {
  if (!first || !second) {
    return 0;
  }

  const fields = [
    'browser',
    'browser_version',
    'operating_system',
    'timezone',
    'language',
    'screen_resolution',
    'color_depth',
    'platform',
    'hardware_concurrency',
    'device_memory',
    'touch_capability',
  ];

  let matches = 0;

  fields.forEach((field) => {
    if (
      first[field] !== undefined &&
      second[field] !== undefined &&
      first[field] === second[field]
    ) {
      matches += 1;
    }
  });

  return Math.round(
    (matches / fields.length) * 100
  );
}

export function compareFingerprints(
  trusted,
  current
) {
  const similarity = fingerprintSimilarity(
    trusted,
    current
  );

  return {
    similarity,
    changed: similarity < 75,
    suspicious: similarity < 50,
    matched: similarity >= 90,
  };
}

export function fingerprintChanged(
  trusted,
  current
) {
  return compareFingerprints(
    trusted,
    current
  ).changed;
}

export function storeTrustedFingerprint(
  fingerprint
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    FINGERPRINT_KEY,
    JSON.stringify(fingerprint)
  );
}

export function getTrustedFingerprint() {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(
    FINGERPRINT_KEY
  );

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function clearFingerprint() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(FINGERPRINT_KEY);
}

export function generateNewFingerprint() {
  const fingerprint =
    generateSessionFingerprint();

  storeTrustedFingerprint(fingerprint);

  return fingerprint;
}