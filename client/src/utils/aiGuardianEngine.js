import { supabase } from '../lib/supabase';
import {
  calculateFutureRiskScore,
  generatePreventiveRecommendations,
  getPredictionStatus,
} from './threatPredictionEngine';

let guardianCache = null;
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

async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user || null;
}

export async function analyzeAccountHealth() {
  const user = await getUser();

  return {
    healthy: Boolean(user),
    confidence: user ? 85 : 35,
    reason: user
      ? 'Authenticated account context is available.'
      : 'Guest mode has limited account context.',
    affected_systems: ['account'],
  };
}

export async function analyzeSecurityHealth() {
  const result = await getPredictionStatus();
  const score = result.predictions
    .filter((item) =>
      [
        'Account Takeover',
        'Device Compromise',
        'Session Hijacking',
      ].includes(item.category)
    )
    .reduce(
      (total, item) => total + item.score,
      0
    );

  return {
    healthy: score < 40,
    score,
    confidence: 80,
    reason:
      score < 40
        ? 'Security signals are currently stable.'
        : 'Security signals require review.',
    affected_systems: [
      'authentication',
      'devices',
      'sessions',
    ],
  };
}

export async function analyzePrivacyHealth() {
  const result = await getPredictionStatus();
  const item = result.predictions.find(
    (prediction) =>
      prediction.category === 'Privacy Exposure'
  );

  return {
    healthy: !item || item.score < 40,
    score: item?.score || 0,
    confidence: item?.confidence || 75,
    reason:
      item?.reason ||
      'Privacy exposure indicators are low.',
    affected_systems: ['privacy', 'profile'],
  };
}

export async function analyzeDeviceHealth() {
  const result = await getPredictionStatus();
  const item = result.predictions.find(
    (prediction) =>
      prediction.category === 'Device Compromise'
  );

  return {
    healthy: !item || item.score < 40,
    score: item?.score || 0,
    confidence: item?.confidence || 75,
    reason:
      item?.reason ||
      'Device activity is stable.',
    affected_systems: ['devices'],
  };
}

export async function analyzeSessionHealth() {
  const result = await getPredictionStatus();
  const item = result.predictions.find(
    (prediction) =>
      prediction.category === 'Session Hijacking'
  );

  return {
    healthy: !item || item.score < 40,
    score: item?.score || 0,
    confidence: item?.confidence || 75,
    reason:
      item?.reason ||
      'Session activity is stable.',
    affected_systems: ['sessions'],
  };
}

export async function generateGuardianInsights() {
  const [
    account,
    security,
    privacy,
    device,
    session,
  ] = await Promise.all([
    analyzeAccountHealth(),
    analyzeSecurityHealth(),
    analyzePrivacyHealth(),
    analyzeDeviceHealth(),
    analyzeSessionHealth(),
  ]);

  return {
    account,
    security,
    privacy,
    device,
    session,
    generated_at: new Date().toISOString(),
  };
}

export async function generateGuardianWarnings() {
  const result = await getPredictionStatus();

  return result.predictions.filter(
    (prediction) => prediction.score >= 40
  );
}

export async function generateGuardianActions() {
  const result = await getPredictionStatus();

  return generatePreventiveRecommendations(
    result.predictions
  );
}

export async function explainGuardianDecision(
  decision
) {
  return {
    title: decision?.title || decision?.category,
    why:
      decision?.why ||
      decision?.reason ||
      'This recommendation was generated from recent security signals.',
    confidence: decision?.confidence || 70,
    affected_systems:
      decision?.affected_systems || [],
    suggested_action:
      decision?.suggested_action ||
      decision?.title ||
      'Review the related security settings.',
    estimated_impact:
      decision?.impact ||
      'Preventive protection value.',
  };
}

export async function initializeAIGuardian() {
  if (guestMode()) {
    return {
      enabled: true,
      guest: true,
      personalized: false,
      score: 0,
      level: 'Minimal',
    };
  }

  const status = await getGuardianStatus();

  return {
    enabled: true,
    guest: false,
    personalized: true,
    ...status,
  };
}

export async function getGuardianStatus() {
  if (
    guardianCache &&
    Date.now() - cacheTime < 30000
  ) {
    return guardianCache;
  }

  const forecast = await getPredictionStatus();
  const insights =
    await generateGuardianInsights();

  const result = {
    score: calculateFutureRiskScore(
      forecast.predictions
    ),
    level: forecast.level,
    forecast,
    insights,
    warnings: forecast.predictions.filter(
      (item) => item.score >= 40
    ),
    actions: generatePreventiveRecommendations(
      forecast.predictions
    ),
    autonomous_protection: false,
  };

  guardianCache = result;
  cacheTime = Date.now();

  return result;
}

export function clearGuardianCache() {
  guardianCache = null;
  cacheTime = 0;
}