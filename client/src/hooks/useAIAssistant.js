import { useCallback, useEffect, useState } from 'react';

import {
  askAssistant,
  clearConversationHistory,
  generateSmartSuggestions,
  getAssistantStatus,
  getConversationHistory,
} from '../utils/aiAssistantEngine';
import {
  getAutomationRules,
} from '../utils/automationEngine';

export default function useAIAssistant() {
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] =
    useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setError('');

      const [
        assistantStatus,
        history,
        smartSuggestions,
        automationRules,
      ] = await Promise.all([
        getAssistantStatus(),
        getConversationHistory({
          page: 0,
          pageSize: 30,
        }),
        generateSmartSuggestions(),
        getAutomationRules(),
      ]);

      setStatus(assistantStatus);
      setMessages(history || []);
      setSuggestions(
        smartSuggestions?.suggestions || []
      );
      setRules(automationRules || []);
    } catch (loadError) {
      setError(
        loadError?.message ||
          'Unable to load AI assistant.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const ask = useCallback(
    async (question, context = {}) => {
      const response = await askAssistant(
        question,
        context
      );

      setMessages((current) => [
        ...current,
        response,
      ]);

      return response;
    },
    []
  );

  const clearHistory = useCallback(async () => {
    await clearConversationHistory();
    setMessages([]);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    status,
    messages,
    suggestions,
    rules,
    loading,
    error,
    ask,
    clearHistory,
    refresh,
  };
}