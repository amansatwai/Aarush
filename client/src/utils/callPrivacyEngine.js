const CALL_PRIVACY_KEY = 'aarush_call_privacy_state';
const CALL_EVENTS_KEY = 'aarush_call_security_timeline';

const DEFAULT_STATE = {
  score: 98,
  voice: {
    voiceMask: false,
    noiseIsolation: true,
    privateVoiceMode: true,
    voiceEncryption: true,
    aiVoiceProtection: true,
  },
  video: {
    facePresence: true,
    cameraShield: true,
    backgroundPrivacy: true,
    lowVisibility: false,
    aiVideoProtection: true,
  },
  screenShare: {
    protectedShare: true,
    hideNotifications: true,
    hideSensitiveApps: true,
    hidePasswordFields: true,
    hideOtpMessages: true,
    blurSelectedAreas: true,
    aiSensitiveDetection: true,
    stopOnRisk: true,
  },
  privacyBubble: {
    blurSurroundings: true,
    dimScreen: false,
    hideUiElements: false,
    reduceViewingAngle: false,
    lockOrientation: false,
    temporaryOverlay: true,
  },
  shoulderSurf: {
    blurChat: true,
    blurControls: true,
    blurSharedContent: true,
    detectNearbyViewing: false,
    emergencyBlur: true,
    oneTapHide: true,
  },
  proximity: {
    lockWhenUserLeaves: false,
    biometricOnReturn: true,
    autoMute: false,
    autoPauseVideo: false,
    autoHideShare: true,
    resumeAfterVerification: true,
  },
  companion: {
    newDeviceDetection: true,
    bluetoothAlert: false,
    externalDisplayAlert: true,
    screenMirroringDetection: true,
    recordingDeviceDetection: true,
    wearableAwareness: false,
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readState() {
  if (typeof window === 'undefined') {
    return clone(DEFAULT_STATE);
  }

  try {
    const saved = window.localStorage.getItem(CALL_PRIVACY_KEY);

    if (!saved) {
      return clone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      voice: { ...DEFAULT_STATE.voice, ...(parsed.voice || {}) },
      video: { ...DEFAULT_STATE.video, ...(parsed.video || {}) },
      screenShare: {
        ...DEFAULT_STATE.screenShare,
        ...(parsed.screenShare || {}),
      },
      privacyBubble: {
        ...DEFAULT_STATE.privacyBubble,
        ...(parsed.privacyBubble || {}),
      },
      shoulderSurf: {
        ...DEFAULT_STATE.shoulderSurf,
        ...(parsed.shoulderSurf || {}),
      },
      proximity: {
        ...DEFAULT_STATE.proximity,
        ...(parsed.proximity || {}),
      },
      companion: {
        ...DEFAULT_STATE.companion,
        ...(parsed.companion || {}),
      },
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function saveState(state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CALL_PRIVACY_KEY, JSON.stringify(state));
  }
}

export function getCallPrivacyState() {
  return readState();
}

export function updateCallPrivacySetting(section, id, enabled) {
  const current = readState();

  const next = {
    ...current,
    [section]: {
      ...current[section],
      [id]: Boolean(enabled),
    },
  };

  saveState(next);
  return next;
}

export function calculateCallPrivacyScore(state = readState()) {
  const sections = [
    state.voice,
    state.video,
    state.screenShare,
    state.privacyBubble,
    state.shoulderSurf,
    state.proximity,
    state.companion,
  ];

  const enabled = sections
    .flatMap((section) => Object.values(section))
    .filter(Boolean).length;

  return Math.min(100, Math.max(70, 70 + enabled * 2));
}

export function getCallPrivacyLevel(score) {
  if (score >= 95) return 'Fully Protected';
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Moderate';
  return 'Exposed';
}

export function recordCallSecurityEvent({
  event,
  severity = 'Low',
  status = 'Protected',
}) {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = getCallSecurityTimeline();

  const nextEvent = {
    id: `call-event-${Date.now()}`,
    event,
    severity,
    status,
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
  };

  window.localStorage.setItem(
    CALL_EVENTS_KEY,
    JSON.stringify([nextEvent, ...existing].slice(0, 100))
  );

  return nextEvent;
}

export function getCallSecurityTimeline() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(CALL_EVENTS_KEY) || '[]'
    );
  } catch {
    return [];
  }
}

export async function requestMicrophonePermission() {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return {
      granted: false,
      supported: false,
      error: 'Microphone access is not supported by this browser.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    stream.getTracks().forEach((track) => track.stop());

    return {
      granted: true,
      supported: true,
    };
  } catch {
    return {
      granted: false,
      supported: true,
      error: 'Microphone permission was denied or unavailable.',
    };
  }
}

export async function requestCameraPermission() {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return {
      granted: false,
      supported: false,
      error: 'Camera access is not supported by this browser.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });

    stream.getTracks().forEach((track) => track.stop());

    return {
      granted: true,
      supported: true,
    };
  } catch {
    return {
      granted: false,
      supported: true,
      error: 'Camera permission was denied or unavailable.',
    };
  }
}

export default {
  getCallPrivacyState,
  updateCallPrivacySetting,
  calculateCallPrivacyScore,
  getCallPrivacyLevel,
  recordCallSecurityEvent,
  getCallSecurityTimeline,
  requestMicrophonePermission,
  requestCameraPermission,
};