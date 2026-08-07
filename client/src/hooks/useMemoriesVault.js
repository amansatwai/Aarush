import { useCallback, useMemo, useState } from 'react';
import {
  createVaultFolder,
  getMemoryItems,
  getStorageStats,
  getVaultState,
  getVaultTimeline,
  recordVaultEvent,
  updateVaultState,
} from '../utils/vaultEngine';

export default function useMemoriesVault() {
  const [state, setState] = useState(getVaultState);
  const [timeline, setTimeline] = useState(getVaultTimeline);
  const [message, setMessage] = useState('');

  const storage = useMemo(() => getStorageStats(state), [state]);

  const update = useCallback((updates) => {
    setState((current) => updateVaultState(updates));
  }, []);

  const createFolder = useCallback((name) => {
    setState(() => createVaultFolder(name));
  }, []);

  const recordEvent = useCallback((event, status) => {
    setTimeline(recordVaultEvent(event, status));
  }, []);

  const showMessage = useCallback((text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3200);
  }, []);

  return {
    state,
    storage,
    timeline,
    memoryItems: getMemoryItems(),
    message,
    update,
    createFolder,
    recordEvent,
    showMessage,
  };
}