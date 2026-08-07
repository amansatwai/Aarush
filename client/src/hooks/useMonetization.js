import { useCallback, useMemo, useState } from 'react';
import {
  currencies,
  formatMoney,
  getMonetizationState,
  getRevenueBreakdown,
  togglePaidFeature,
  updateMonetizationState,
  updateSubscriptionTier,
} from '../utils/monetizationEngine';

export default function useMonetization() {
  const [state, setState] = useState(getMonetizationState);

  const currency = useMemo(
    () => state.currency || 'INR',
    [state.currency]
  );

  const update = useCallback((updates) => {
    setState((current) => updateMonetizationState(updates));
  }, []);

  const updateTier = useCallback((id, updates) => {
    setState(() => updateSubscriptionTier(id, updates));
  }, []);

  const toggleFeature = useCallback((id) => {
    setState(() => togglePaidFeature(id));
  }, []);

  const selectCurrency = useCallback((currencyCode) => {
    setState(() =>
      updateMonetizationState({
        currency: currencyCode,
      })
    );
  }, []);

  return {
    state,
    currency,
    currencies,
    update,
    updateTier,
    toggleFeature,
    selectCurrency,
    formatMoney: (value) => formatMoney(value, currency),
    getRevenueBreakdown,
  };
}