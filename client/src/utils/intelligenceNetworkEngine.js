import {
  getGuardianStatus,
} from './aiGuardianEngine';
import {
  getIntelligenceStatus,
} from './onDeviceIntelligenceEngine';
import {
  getPredictionStatus,
} from './threatPredictionEngine';
import {
  getSecurityStatus,
} from './securityEngine';
import {
  getSyncStatus,
} from './cloudSyncEngine';
import {
  getMemorySummary,
} from './personalAIMemoryEngine';

let networkCache = null;
let networkCacheTime = 0;

const DEFAULT_CONNECTIONS = {
  assistant: false,
  security: false,
  privacy: false,
  backup: false,
  sync: false,
  notifications: false,
  automation: false,
  behavior_learning: false,
  threat_prediction: false,
};

export function initializeIntelligenceNetwork() {
  return {
    enabled: true,
    local_first: true,
    cloud_assisted: true,
    connections: {
      ...DEFAULT_CONNECTIONS,
    },
  };
}

function connect(name) {
  const current =
    networkCache?.connections ||
    DEFAULT_CONNECTIONS;

  networkCache = {
    ...(networkCache || {}),
    connections: {
      ...current,
      [name]: true,
    },
  };
  networkCacheTime = Date.now();

  return networkCache;
}

export function connectAssistant() {
  return connect('assistant');
}

export function connectSecurity() {
  return connect('security');
}

export function connectPrivacy() {
  return connect('privacy');
}

export function connectBackup() {
  return connect('backup');
}

export function connectSync() {
  return connect('sync');
}

export function connectNotifications() {
  return connect('notifications');
}

export function connectAutomation() {
  return connect('automation');
}

export function connectBehaviorLearning() {
  return connect('behavior_learning');
}

export function connectThreatPrediction() {
  return connect('threat_prediction');
}

export async function coordinateIntelligence() {
  const [
    guardian,
    prediction,
    local,
    memory,
    security,
    sync,
  ] = await Promise.all([
    getGuardianStatus(),
    getPredictionStatus(),
    Promise.resolve(
      getIntelligenceStatus()
    ),
    Promise.resolve(getMemorySummary()),
    getSecurityStatus(),
    Promise.resolve(getSyncStatus()),
  ]);

  const result = {
    guardian,
    prediction,
    local,
    memory,
    security,
    sync,
    generated_at: new Date().toISOString(),
  };

  networkCache = result;
  networkCacheTime = Date.now();

  return result;
}

export async function generateUnifiedInsight() {
  const context =
    await coordinateIntelligence();

  return {
    title: 'Unified Aarush insight',
    summary:
      context.prediction?.level === 'Minimal'
        ? 'Your connected Aarush systems are currently stable.'
        : 'Some connected systems may benefit from a security or reliability review.',
    confidence: Math.min(
      95,
      60 +
        Number(context.memory?.preference_count || 0)
    ),
    affected_systems: [
      'security',
      'privacy',
      'backup',
      'sync',
      'behavior',
    ],
    context,
  };
}

export async function generateUnifiedRecommendation() {
  const context =
    await coordinateIntelligence();
  const recommendations = [];

  if (
    context.prediction?.score >= 40
  ) {
    recommendations.push({
      id: 'security-review',
      title: 'Improve account security',
      why:
        'Threat prediction signals are elevated.',
      action: '/security-center',
      confidence: 82,
    });
  }

  if (
    context.sync?.status === 'failed' ||
    context.sync?.status === 'pending'
  ) {
    recommendations.push({
      id: 'sync-review',
      title: 'Improve sync reliability',
      why:
        'Cloud synchronization needs attention.',
      action: '/cloud-center',
      confidence: 78,
    });
  }

  if (
    context.memory?.privacy_count === 0
  ) {
    recommendations.push({
      id: 'privacy-review',
      title: 'Review privacy preferences',
      why:
        'No local privacy choices have been learned yet.',
      action: '/social-privacy-settings',
      confidence: 70,
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: 'backup-review',
      title: 'Maintain backup readiness',
      why:
        'Regular verified backups improve recovery readiness.',
      action: '/backup-center',
      confidence: 75,
    });
  }

  return {
    recommendations,
    generated_at: new Date().toISOString(),
  };
}

export function getNetworkStatus() {
  if (
    networkCache &&
    Date.now() - networkCacheTime < 30000
  ) {
    return networkCache;
  }

  return {
    enabled: true,
    local_first: true,
    cloud_assisted: true,
    connections: {
      ...DEFAULT_CONNECTIONS,
    },
  };
}

export function clearNetworkCache() {
  networkCache = null;
  networkCacheTime = 0;
}