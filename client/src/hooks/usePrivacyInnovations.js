import { useCallback, useMemo, useState } from 'react';
import {
  getInnovationLevel,
  getInnovationScore,
  getInnovationState,
  getInnovationSystems,
  getPrivacyTimeline,
  setMicroTimeout,
  updateInnovationSetting,
} from '../utils/privacyInnovationEngine';

export default function usePrivacyInnovations() {
  const [state, setState] = useState(getInnovationState);

  const score = getInnovationScore(state);
  const level = getInnovationLevel(score);

  const toggle = useCallback((section, id) => {
    setState((current) =>
      updateInnovationSetting(section, id, !current[section][id])
    );
  }, []);

  const setValue = useCallback((section, id, value) => {
    setState((current) => updateInnovationSetting(section, id, value));
  }, []);

  const setTimeoutValue = useCallback((id, value) => {
    setState(() => setMicroTimeout(id, value));
  }, []);

  const timeline = useMemo(() => getPrivacyTimeline(), []);
  const systems = useMemo(() => getInnovationSystems(), []);

  return {
    state,
    score,
    level,
    toggle,
    setValue,
    setTimeoutValue,
    timeline,
    systems,
  };
}