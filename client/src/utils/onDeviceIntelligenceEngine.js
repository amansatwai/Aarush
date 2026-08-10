import {
  detectBehaviorDeviation,
  getBehaviorProfile,
} from './behavioralLearningEngine';

let intelligenceCache = null;
let cacheTime = 0;

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

function confidence(profile) {
  const values = Object.values(profile || {});
  const signals = values.reduce((total, value) => {
    if (typeof value === 'number') {
      return total + value;
    }

    if (value && typeof value === 'object') {
      return total + Number(value.count || 0);
    }

    return total;
  }, 0);

  return Math.min(100, Math.round(signals * 2));
}

export async function initializeOnDeviceIntelligence() {
  const profile = getBehaviorProfile();

  return {
    enabled: true,
    local_only: true,
    guest: guestMode(),
    profile,
    confidence: confidence(profile),
  };
}

export function analyzeUsagePatterns() {
  const profile = getBehaviorProfile();

  return {
    sessions: profile.sessions,
    interactions: profile.interactions,
    time_patterns: profile.time_patterns,
    confidence: confidence(profile),
  };
}

export function analyzePrivacyBehavior() {
  const profile = getBehaviorProfile();

  return {
    preferences: profile.privacy,
    confidence: confidence(profile.privacy),
    deviations: profile.deviations.filter(
      (item) => item.category === 'privacy'
    ),
  };
}

export function analyzeSecurityBehavior() {
  const profile = getBehaviorProfile();

  return {
    preferences: profile.security,
    confidence: confidence(profile.security),
    deviations: profile.deviations.filter(
      (item) => item.category === 'security'
    ),
  };
}

export function analyzeNotificationBehavior() {
  const profile = getBehaviorProfile();

  return {
    preferences: profile.notifications,
    confidence: confidence(profile.notifications),
  };
}

export function analyzeDeviceBehavior() {
  const profile = getBehaviorProfile();

  return {
    devices: profile.device_patterns,
    confidence: confidence(profile.device_patterns),
  };
}

export function analyzeSessionBehavior() {
  const profile = getBehaviorProfile();

  return {
    sessions: profile.sessions,
    confidence: confidence(profile.sessions),
  };
}

export function calculateBehaviorConfidence() {
  return confidence(getBehaviorProfile());
}

export function generateLocalInsights() {
  const profile = getBehaviorProfile();
  const insights = [];

  if (!profile.security.app_lock) {
    insights.push({
      id: 'app-lock',
      level: 'Recommended',
      title: 'Enable app lock',
      description:
        'Protect Aarush when your device is unlocked.',
      action: '/app-lock-settings',
    });
  }

  if (!profile.privacy.profile_visibility) {
    insights.push({
      id: 'privacy-review',
      level: 'Recommended',
      title: 'Review privacy settings',
      description:
        'Check profile, story, and messaging visibility.',
      action: '/social-privacy-settings',
    });
  }

  if (!Object.keys(profile.device_patterns).length) {
    insights.push({
      id: 'device-review',
      level: 'Informational',
      title: 'Review trusted devices',
      description:
        'Check which devices can access your account.',
      action: '/security-center',
    });
  }

  if (profile.deviations.length) {
    insights.push({
      id: 'behavior-deviation',
      level: 'Strongly Recommended',
      title: 'Review unusual activity',
      description:
        'Some recent activity differs from your usual patterns.',
      action: '/threat-center',
    });
  }

  return insights;
}

export function generatePrivacyRecommendations() {
  return generateLocalInsights().filter(
    (item) =>
      item.id === 'privacy-review' ||
      item.id === 'app-lock'
  );
}

export function generateSecurityRecommendations() {
  return generateLocalInsights().filter(
    (item) =>
      item.id === 'device-review' ||
      item.id === 'behavior-deviation' ||
      item.id === 'app-lock'
  );
}

export function getIntelligenceStatus() {
  if (
    intelligenceCache &&
    Date.now() - cacheTime < 30000
  ) {
    return intelligenceCache;
  }

  const profile = getBehaviorProfile();

  intelligenceCache = {
    enabled: true,
    local_only: true,
    guest: guestMode(),
    confidence: confidence(profile),
    insights: generateLocalInsights(),
  };

  cacheTime = Date.now();

  return intelligenceCache;
}

export function refreshIntelligence() {
  intelligenceCache = null;
  cacheTime = 0;

  return getIntelligenceStatus();
}

export function checkBehaviorDeviation(
  category,
  value
) {
  return detectBehaviorDeviation(
    category,
    value
  );
}