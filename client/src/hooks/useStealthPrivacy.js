import { useCallback, useState } from 'react';
import {
  createPersona,
  deletePersona,
  getIdentityRisks,
  getPersonas,
  getStealthState,
  savePersonas,
  setAudienceRing,
  setStealthMode,
  updatePersona,
  updateStealthSetting,
} from '../utils/identityShield';

export default function useStealthPrivacy() {
  const [state, setState] = useState(getStealthState);
  const [personas, setPersonas] = useState(getPersonas);
  const [scanResult, setScanResult] = useState(null);

  const toggleSetting = useCallback((section, id) => {
    setState((current) => {
      const next = updateStealthSetting(
        section,
        id,
        !current[section][id]
      );

      return next;
    });
  }, []);

  const activate = useCallback(() => {
    const next = setStealthMode(true);
    setState(next);
    return next;
  }, []);

  const deactivate = useCallback(() => {
    const next = setStealthMode(false);
    setState(next);
    return next;
  }, []);

  const changeAudienceRing = useCallback((audience) => {
    const next = setAudienceRing(audience);
    setState(next);
    return next;
  }, []);

  const scanIdentity = useCallback(() => {
    const result = {
      completedAt: new Date().toISOString(),
      risks: getIdentityRisks(),
      summary:
        'Identity protection scan completed. One impersonation signal requires review.',
    };

    setScanResult(result);
    return result;
  }, []);

  const addPersona = useCallback((persona) => {
    const next = createPersona(persona);
    setPersonas(next);
    return next;
  }, []);

  const editPersona = useCallback((id, updates) => {
    const next = updatePersona(id, updates);
    setPersonas(next);
    return next;
  }, []);

  const removePersona = useCallback((id) => {
    const next = deletePersona(id);
    setPersonas(next);
    return next;
  }, []);

  const persistPersonas = useCallback((nextPersonas) => {
    savePersonas(nextPersonas);
    setPersonas(nextPersonas);
  }, []);

  return {
    state,
    active: state.active,
    personas,
    scanResult,
    toggleSetting,
    activate,
    deactivate,
    changeAudienceRing,
    scanIdentity,
    addPersona,
    editPersona,
    removePersona,
    persistPersonas,
    identityRisks: getIdentityRisks(),
  };
}