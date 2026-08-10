import { useCallback, useEffect, useState } from 'react';

import {
  generateLocalInsights,
  generatePrivacyRecommendations,
  generateSecurityRecommendations,
  getIntelligenceStatus,
  refreshIntelligence,
} from '../utils/onDeviceIntelligenceEngine';
import {
  getBehaviorProfile,
  initializeBehavioralLearning,
  resetBehaviorProfile,
} from '../utils/behavioralLearningEngine';

export default function useSmartPrivacy() {
  const [status, setStatus] = useState(null);
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    try {
      const nextStatus = getIntelligenceStatus();

      setStatus(nextStatus);
      setProfile(getBehaviorProfile());
      setInsights(generateLocalInsights());
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load smart privacy status.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const analyze = useCallback(() => {
    const nextStatus = refreshIntelligence();

    setStatus(nextStatus);
    setProfile(getBehaviorProfile());
    setInsights(generateLocalInsights());

    return nextStatus;
  }, []);

  const resetLearning = useCallback(() => {
    const nextProfile = resetBehaviorProfile();

    setProfile(nextProfile);
    setStatus(getIntelligenceStatus());
    setInsights([]);
  }, []);

  useEffect(() => {
    initializeBehavioralLearning();
    refresh();
  }, [refresh]);

  return {
    status,
    profile,
    insights,
    privacyRecommendations:
      generatePrivacyRecommendations(),
    securityRecommendations:
      generateSecurityRecommendations(),
    loading,
    error,
    analyze,
    refresh,
    resetLearning,
  };
}