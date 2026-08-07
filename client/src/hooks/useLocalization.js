import { useCallback, useMemo, useState } from 'react';
import {
  getCountry,
  getDirection,
  getLanguage,
  getPreferences,
  savePreferences,
} from '../utils/localizationEngine';

export default function useLocalization() {
  const [preferences, setPreferences] = useState(getPreferences);

  const language = useMemo(
    () => getLanguage(preferences.language),
    [preferences.language]
  );

  const country = useMemo(
    () => getCountry(preferences.country),
    [preferences.country]
  );

  const direction = getDirection(preferences.language);

  const update = useCallback((updates) => {
    setPreferences((current) => {
      const next = {
        ...current,
        ...updates,
      };

      savePreferences(next);
      return next;
    });
  }, []);

  const updateAccessibility = useCallback((id, enabled) => {
    setPreferences((current) => {
      const next = {
        ...current,
        accessibility: {
          ...current.accessibility,
          [id]: Boolean(enabled),
        },
      };

      savePreferences(next);
      return next;
    });
  }, []);

  return {
    preferences,
    language,
    country,
    direction,
    update,
    updateAccessibility,
  };
}