const PROFILE_KEY =
  'aarush_local_behavior_profile';

const DEFAULT_PROFILE = {
  interactions: {},
  privacy: {},
  security: {},
  notifications: {},
  sessions: {},
  time_patterns: {},
  device_patterns: {},
  deviations: [],
  updated_at: null,
};

function readProfile() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PROFILE };
  }

  try {
    return {
      ...DEFAULT_PROFILE,
      ...JSON.parse(
        localStorage.getItem(PROFILE_KEY) || '{}'
      ),
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function saveProfile(profile) {
  const next = {
    ...profile,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(next)
    );
  }

  return next;
}

function increment(target, key, amount = 1) {
  target[key] = Number(target[key] || 0) + amount;
}

export function initializeBehavioralLearning() {
  return readProfile();
}

export function learnInteractionPattern(
  action,
  metadata = {}
) {
  const profile = readProfile();

  increment(profile.interactions, action);
  profile.interactions.last = {
    action,
    metadata,
    at: new Date().toISOString(),
  };

  return saveProfile(profile);
}

export function learnPrivacyPreference(
  setting,
  value
) {
  const profile = readProfile();

  profile.privacy[setting] = {
    value,
    count:
      Number(profile.privacy[setting]?.count || 0) + 1,
    updated_at: new Date().toISOString(),
  };

  return saveProfile(profile);
}

export function learnSecurityPreference(
  setting,
  value
) {
  const profile = readProfile();

  profile.security[setting] = {
    value,
    count:
      Number(profile.security[setting]?.count || 0) + 1,
    updated_at: new Date().toISOString(),
  };

  return saveProfile(profile);
}

export function learnNotificationPreference(
  setting,
  value
) {
  const profile = readProfile();

  profile.notifications[setting] = {
    value,
    count:
      Number(
        profile.notifications[setting]?.count || 0
      ) + 1,
  };

  return saveProfile(profile);
}

export function learnSessionPattern(
  metadata = {}
) {
  const profile = readProfile();
  const hour = new Date().getHours();

  increment(
    profile.sessions,
    metadata.type || 'session'
  );
  increment(profile.time_patterns, String(hour));

  return saveProfile(profile);
}

export function learnTimePattern(metadata = {}) {
  const profile = readProfile();
  const hour =
    metadata.hour ?? new Date().getHours();

  increment(profile.time_patterns, String(hour));

  return saveProfile(profile);
}

export function learnDevicePattern(
  deviceType,
  metadata = {}
) {
  const profile = readProfile();

  increment(
    profile.device_patterns,
    deviceType || 'unknown'
  );

  profile.device_patterns.last = {
    deviceType,
    metadata,
    at: new Date().toISOString(),
  };

  return saveProfile(profile);
}

export function predictPreferredAction(
  category,
  candidates = []
) {
  const profile = readProfile();
  const source = profile[category] || {};

  return candidates
    .map((candidate) => ({
      ...candidate,
      confidence: Number(
        source[candidate.id || candidate.key] || 0
      ),
    }))
    .sort(
      (first, second) =>
        second.confidence - first.confidence
    );
}

export function detectBehaviorDeviation(
  category,
  value
) {
  const profile = readProfile();
  const source = profile[category] || {};
  const values = Object.values(source).filter(
    (item) => typeof item === 'number'
  );

  if (!values.length) {
    return {
      deviated: false,
      confidence: 0,
    };
  }

  const average =
    values.reduce((sum, item) => sum + item, 0) /
    values.length;

  const deviation =
    Math.abs(Number(value || 0) - average);

  const deviated = deviation > Math.max(3, average);

  const result = {
    category,
    value,
    average,
    deviation,
    deviated,
    detected_at: new Date().toISOString(),
  };

  if (deviated) {
    profile.deviations = [
      result,
      ...profile.deviations,
    ].slice(0, 30);

    saveProfile(profile);
  }

  return result;
}

export function getBehaviorProfile() {
  return readProfile();
}

export function resetBehaviorProfile() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROFILE_KEY);
  }

  return { ...DEFAULT_PROFILE };
}