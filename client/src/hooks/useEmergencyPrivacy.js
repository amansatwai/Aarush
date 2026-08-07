import { useCallback, useEffect, useState } from 'react';
import {
  activateEmergencyPrivacy,
  deactivateEmergencyPrivacy,
  getEmergencyPrivacyState,
  recordEmergencyEvent,
  saveEmergencyPrivacyState,
  updateEmergencyProtection,
} from '../utils/privacyProtection';

export default function useEmergencyPrivacy({
  onActivated,
  onDeactivated,
  onSecureLogout,
} = {}) {
  const [state, setState] = useState(getEmergencyPrivacyState);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key) {
        setState(getEmergencyPrivacyState());
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const activate = useCallback(
    (actions = {}) => {
      const next = activateEmergencyPrivacy(actions);
      setState(next);
      onActivated?.(next);
      return next;
    },
    [onActivated]
  );

  const deactivate = useCallback(() => {
    const next = deactivateEmergencyPrivacy();
    setState(next);
    onDeactivated?.(next);
    return next;
  }, [onDeactivated]);

  const toggleProtection = useCallback((id) => {
    setState((current) => {
      const next = updateEmergencyProtection(
        id,
        !current.protections[id]
      );

      return next;
    });
  }, []);

  const setProtection = useCallback((id, enabled) => {
    setState((current) => {
      const next = updateEmergencyProtection(id, enabled);
      return next;
    });
  }, []);

  const lockApp = useCallback(() => {
    const next = activate({
      lockAllSessions: true,
      hideChats: true,
      hideMemories: true,
      hideNotifications: true,
    });

    recordEmergencyEvent({
      triggerType: 'lock-app',
      actionsExecuted: ['App locked', 'Sensitive content hidden'],
      sessionStatus: 'App lock requested',
    });

    return next;
  }, [activate]);

  const secureLogout = useCallback(async () => {
    const next = activate({
      logoutOtherDevices: true,
      lockAllSessions: true,
      freezeAccountAccess: true,
    });

    recordEmergencyEvent({
      triggerType: 'secure-logout',
      actionsExecuted: [
        'Other sessions revoked',
        'All sessions locked',
        'Account access frozen',
      ],
      sessionStatus: 'Secure logout requested',
    });

    await onSecureLogout?.(next);
    return next;
  }, [activate, onSecureLogout]);

  const markDeviceSafe = useCallback(() => {
    setState((current) => {
      const next = {
        ...current,
        protections: {
          ...current.protections,
          markCurrentDeviceSafe: true,
        },
      };

      saveEmergencyPrivacyState(next);
      return next;
    });
  }, []);

  return {
    state,
    active: state.active,
    protections: state.protections,
    activate,
    deactivate,
    toggleProtection,
    setProtection,
    lockApp,
    secureLogout,
    markDeviceSafe,
  };
}