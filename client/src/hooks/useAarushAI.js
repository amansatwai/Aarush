import { useCallback, useMemo, useState } from 'react';
import {
  analyzeConversations,
  analyzeDevices,
  getAIProtectionLevel,
  getAIProtectionScore,
  getAIState,
  getAITimeline,
  getFakeAccountSignals,
  getMediaSignals,
  getPrivacyRecommendations,
  getScamSignals,
  getThreatModules,
  runAccountScan,
  updateAutomaticProtection,
} from '../utils/aiSecurityEngine';

export default function useAarushAI() {
  const [state, setState] = useState(getAIState);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const score = getAIProtectionScore(state);
  const level = getAIProtectionLevel(score);

  const scanAccount = useCallback(() => {
    setBusy(true);

    const result = runAccountScan();

    setState(getAIState());
    setLastResult(result);
    setBusy(false);

    return result;
  }, []);

  const scanDevices = useCallback(() => {
    const result = analyzeDevices();
    setLastResult(result);
    return result;
  }, []);

  const scanConversations = useCallback(() => {
    const result = analyzeConversations();
    setLastResult(result);
    return result;
  }, []);

  const toggleAutomaticProtection = useCallback((id) => {
    setState((current) =>
      updateAutomaticProtection(
        id,
        !current.automaticProtection[id]
      )
    );
  }, []);

  const recommendations = useMemo(
    () => getPrivacyRecommendations(),
    []
  );

  return {
    state,
    score,
    level,
    busy,
    lastResult,
    scanAccount,
    scanDevices,
    scanConversations,
    toggleAutomaticProtection,
    threatModules: getThreatModules(),
    fakeAccountSignals: getFakeAccountSignals(),
    scamSignals: getScamSignals(),
    mediaSignals: getMediaSignals(),
    recommendations,
    timeline: getAITimeline(),
  };
}