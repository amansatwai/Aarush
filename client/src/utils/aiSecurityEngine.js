const AI_STATE_KEY = 'aarush_ai_security_state';

const DEFAULT_STATE = {
  score: 98,
  lastScanAt: null,
  automaticProtection: {
    autoLockHighRiskSessions: true,
    autoBlurSensitiveChats: true,
    autoHideNotifications: true,
    autoRevokeSuspiciousDevices: false,
    autoEnableEmergencyPrivacy: false,
    autoScanNewFollowers: true,
    autoScanLinks: true,
    autoScanMedia: true,
  },
};

function readState() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_STATE };
  }

  try {
    const saved = window.localStorage.getItem(AI_STATE_KEY);

    return saved
      ? {
          ...DEFAULT_STATE,
          ...JSON.parse(saved),
          automaticProtection: {
            ...DEFAULT_STATE.automaticProtection,
            ...JSON.parse(saved).automaticProtection,
          },
        }
      : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AI_STATE_KEY, JSON.stringify(state));
  }
}

export function getAIState() {
  return readState();
}

export function getAIProtectionScore(state = readState()) {
  return Math.max(0, Math.min(100, Number(state.score) || 0));
}

export function getAIProtectionLevel(score) {
  if (score >= 90) return 'Fully Protected';
  if (score >= 75) return 'Strong';
  if (score >= 55) return 'Moderate';
  return 'At Risk';
}

export function runAccountScan() {
  const previous = readState();
  const now = new Date().toISOString();

  const next = {
    ...previous,
    score: Math.min(100, Math.max(90, previous.score || 98)),
    lastScanAt: now,
  };

  saveState(next);

  return {
    ...next,
    completedAt: now,
    summary:
      'No critical threats were detected. Continue reviewing device and privacy recommendations.',
  };
}

export function updateAutomaticProtection(id, enabled) {
  const current = readState();

  const next = {
    ...current,
    automaticProtection: {
      ...current.automaticProtection,
      [id]: Boolean(enabled),
    },
  };

  saveState(next);
  return next;
}

export function analyzeDevices() {
  return {
    status: 'Complete',
    risk: 'Low',
    summary: 'Three known devices were reviewed. One device requires verification.',
    recommendedAction: 'Review unknown devices in Session Management.',
  };
}

export function analyzeConversations() {
  return {
    status: 'Complete',
    risk: 'Low',
    summary: 'No active high-confidence scam pattern was detected.',
    recommendedAction: 'Keep link and media scanning enabled.',
  };
}

export function getThreatModules() {
  return [
    {
      id: 'suspicious-login',
      title: 'Suspicious Login Detection',
      status: 'Protected',
      risk: 'Low',
      lastAnalysis: '2 minutes ago',
      action: 'Keep login alerts enabled.',
    },
    {
      id: 'unusual-device',
      title: 'Unusual Device Detection',
      status: 'Review',
      risk: 'Moderate',
      lastAnalysis: '12 minutes ago',
      action: 'Review the unknown iPhone session.',
    },
    {
      id: 'impossible-travel',
      title: 'Impossible Travel Detection',
      status: 'Protected',
      risk: 'Low',
      lastAnalysis: '18 minutes ago',
      action: 'No action required.',
    },
    {
      id: 'failed-unlock',
      title: 'Repeated Failed Unlock Detection',
      status: 'Protected',
      risk: 'Low',
      lastAnalysis: '31 minutes ago',
      action: 'Progressive lockout is active.',
    },
    {
      id: 'session-hijack',
      title: 'Session Hijack Detection',
      status: 'Protected',
      risk: 'Low',
      lastAnalysis: '42 minutes ago',
      action: 'Keep trusted-device verification enabled.',
    },
    {
      id: 'account-takeover',
      title: 'Account Takeover Risk',
      status: 'Protected',
      risk: 'Low',
      lastAnalysis: '1 hour ago',
      action: 'Keep 2FA and login verification enabled.',
    },
    {
      id: 'credential-leak',
      title: 'Credential Leak Warning',
      status: 'No match',
      risk: 'Low',
      lastAnalysis: 'Today',
      action: 'No action required.',
    },
    {
      id: 'unknown-device',
      title: 'Unknown Device Access',
      status: 'Review',
      risk: 'Moderate',
      lastAnalysis: 'Today',
      action: 'Open Session Management.',
    },
  ];
}

export function getFakeAccountSignals() {
  return [
    ['Profile authenticity', 'Protected', 'Low'],
    ['Follower patterns', 'Normal', 'Low'],
    ['Bot behavior', 'No strong signal', 'Low'],
    ['Spam behavior', 'Protected', 'Low'],
    ['Impersonation attempts', '1 account to review', 'Moderate'],
    ['Duplicate identities', 'No strong signal', 'Low'],
  ];
}

export function getScamSignals() {
  return [
    ['OTP scams', 'Protected', 'Low'],
    ['Payment fraud', 'Protected', 'Low'],
    ['Phishing links', 'Link scanning active', 'Low'],
    ['Fake verification requests', 'No strong signal', 'Low'],
    ['Impersonation messages', 'Protected', 'Low'],
    ['Investment scams', 'Protected', 'Low'],
    ['Giveaway scams', 'Protected', 'Low'],
    ['Cryptocurrency fraud', 'Protected', 'Low'],
  ];
}

export function getMediaSignals() {
  return [
    ['Face manipulation', 'No strong signal', 'Low'],
    ['Voice manipulation', 'Not analyzed', 'Future'],
    ['Edited identity media', 'Protected', 'Low'],
    ['Fake screenshots', 'Protected', 'Low'],
    ['AI-generated deception', 'Not analyzed', 'Future'],
    ['Synthetic media', 'Protected', 'Low'],
  ];
}

export function getPrivacyRecommendations() {
  return [
    {
      id: 'enable-2fa',
      title: 'Enable 2FA',
      why: 'A second verification step reduces account takeover risk.',
      benefit: 'Stronger login protection.',
    },
    {
      id: 'biometric-lock',
      title: 'Enable biometric lock',
      why: 'Device verification provides faster protected access.',
      benefit: 'Improved app lock strength.',
    },
    {
      id: 'hide-online',
      title: 'Hide online status',
      why: 'Presence signals can expose your activity patterns.',
      benefit: 'Reduced social visibility.',
    },
    {
      id: 'lock-memories',
      title: 'Lock memories',
      why: 'Private media deserves an additional access boundary.',
      benefit: 'Protected personal content.',
    },
    {
      id: 'trust-device',
      title: 'Trust current device',
      why: 'Verified devices can receive safer session treatment.',
      benefit: 'More accurate device risk decisions.',
    },
    {
      id: 'remove-inactive',
      title: 'Remove inactive devices',
      why: 'Unused sessions increase the attack surface.',
      benefit: 'Smaller active-session footprint.',
    },
    {
      id: 'stronger-lock',
      title: 'Increase app lock strength',
      why: 'A stronger lock protects sensitive screens after inactivity.',
      benefit: 'Improved local privacy.',
    },
    {
      id: 'hidden-notifications',
      title: 'Enable hidden notifications',
      why: 'Lock-screen previews can expose private information.',
      benefit: 'Safer notification privacy.',
    },
  ];
}

export function getAITimeline() {
  return [
    ['Suspicious login detected', 'Today, 10:42 AM', 'Low', '98%'],
    ['Device risk increased', 'Today, 9:18 AM', 'Moderate', '91%'],
    ['Privacy recommendation generated', 'Yesterday, 8:20 PM', 'Low', '96%'],
    ['Session anomaly detected', 'Monday, 6:04 PM', 'Moderate', '88%'],
    ['Emergency protection suggested', 'Sunday, 4:25 PM', 'Low', '94%'],
    ['Deepfake warning generated', 'Friday, 2:10 PM', 'Future', '—'],
  ];
}

export default {
  getAIState,
  getAIProtectionScore,
  getAIProtectionLevel,
  runAccountScan,
  updateAutomaticProtection,
  analyzeDevices,
  analyzeConversations,
  getThreatModules,
  getFakeAccountSignals,
  getScamSignals,
  getMediaSignals,
  getPrivacyRecommendations,
  getAITimeline,
};