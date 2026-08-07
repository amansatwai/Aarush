import { useCallback, useMemo, useState } from 'react';
import {
  calculateCallPrivacyScore,
  getCallPrivacyLevel,
  getCallPrivacyState,
  getCallSecurityTimeline,
  recordCallSecurityEvent,
  requestCameraPermission,
  requestMicrophonePermission,
  updateCallPrivacySetting,
} from '../utils/callPrivacyEngine';

export default function useCallPrivacy() {
  const [state, setState] = useState(getCallPrivacyState);
  const [timeline, setTimeline] = useState(getCallSecurityTimeline);
  const [message, setMessage] = useState('');

  const score = calculateCallPrivacyScore(state);
  const level = getCallPrivacyLevel(score);

  const toggle = useCallback((section, id) => {
    setState((current) =>
      updateCallPrivacySetting(section, id, !current[section][id])
    );
  }, []);

  const recordEvent = useCallback((event, severity, status) => {
    const nextEvent = recordCallSecurityEvent({
      event,
      severity,
      status,
    });

    setTimeline((current) => [nextEvent, ...current].slice(0, 100));
    return nextEvent;
  }, []);

  const requestMicrophone = useCallback(async () => {
    const result = await requestMicrophonePermission();

    if (result.granted) {
      recordEvent('Microphone permission verified', 'Low', 'Protected');
    }

    setMessage(
      result.granted
        ? 'Microphone permission is available.'
        : result.error
    );

    return result;
  }, [recordEvent]);

  const requestCamera = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result.granted) {
      recordEvent('Camera permission verified', 'Low', 'Protected');
    }

    setMessage(
      result.granted
        ? 'Camera permission is available.'
        : result.error
    );

    return result;
  }, [recordEvent]);

  const activateShield = useCallback(() => {
    const next = getCallPrivacyState();

    const sections = [
      'voice',
      'video',
      'screenShare',
      'privacyBubble',
      'shoulderSurf',
      'proximity',
      'companion',
    ];

    sections.forEach((section) => {
      Object.keys(next[section]).forEach((id) => {
        updateCallPrivacySetting(section, id, true);
      });
    });

    setState(getCallPrivacyState());
    recordEvent('Call privacy shield activated', 'Low', 'Protected');
    setMessage('Call Privacy Shield is active.');
  }, [recordEvent]);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  const timelineItems = useMemo(() => {
    if (timeline.length > 0) {
      return timeline;
    }

    return [
      {
        id: 'default-call-event-1',
        event: 'Secure call started',
        time: 'Today, 10:42 AM',
        date: 'Today',
        severity: 'Low',
        status: 'Protected',
      },
      {
        id: 'default-call-event-2',
        event: 'Screen share protected',
        time: 'Yesterday, 8:18 PM',
        date: 'Yesterday',
        severity: 'Low',
        status: 'Protected',
      },
      {
        id: 'default-call-event-3',
        event: 'AI scam warning generated',
        time: 'Monday, 6:04 PM',
        date: 'Monday',
        severity: 'Moderate',
        status: 'Reviewed',
      },
    ];
  }, [timeline]);

  return {
    state,
    score,
    level,
    message,
    timeline: timelineItems,
    toggle,
    recordEvent,
    activateShield,
    requestMicrophone,
    requestCamera,
    clearMessage,
  };
}