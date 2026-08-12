import { useCallback, useEffect, useState } from 'react';

import {
  getConnectedIntegrations,
  getIntegrationStatus,
  subscribeToIntegrationEvents,
} from '../utils/integrationEngine';
import {
  getWebhookAutomationHistory,
  getWebhookAutomationStatus,
  subscribeToWebhookAutomation,
} from '../utils/webhookAutomationEngine';

export default function useIntegrations() {
  const [connections, setConnections] =
    useState([]);
  const [integrationStatus, setIntegrationStatus] =
    useState(null);
  const [webhookStatus, setWebhookStatus] =
    useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        connected,
        status,
        automationStatus,
        automationHistory,
      ] = await Promise.all([
        getConnectedIntegrations(),
        getIntegrationStatus(),
        getWebhookAutomationStatus(),
        getWebhookAutomationHistory({
          page: 0,
          pageSize: 30,
        }),
      ]);

      setConnections(connected || []);
      setIntegrationStatus(status);
      setWebhookStatus(automationStatus);
      setHistory(automationHistory || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load integrations.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubscribeIntegrations =
      subscribeToIntegrationEvents(refresh);
    const unsubscribeWebhooks =
      subscribeToWebhookAutomation(refresh);

    return () => {
      unsubscribeIntegrations();
      unsubscribeWebhooks();
    };
  }, [refresh]);

  return {
    connections,
    integrationStatus,
    webhookStatus,
    history,
    loading,
    error,
    refresh,
  };
}