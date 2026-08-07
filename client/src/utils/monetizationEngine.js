const MONETIZATION_KEY = 'aarush_monetization_state';

export const currencies = [
  ['IN', 'India', 'INR', '₹'],
  ['US', 'United States', 'USD', '$'],
  ['GB', 'United Kingdom', 'GBP', '£'],
  ['EU', 'European Union', 'EUR', '€'],
  ['JP', 'Japan', 'JPY', '¥'],
  ['AE', 'UAE', 'AED', 'د.إ'],
  ['SA', 'Saudi Arabia', 'SAR', '﷼'],
  ['SG', 'Singapore', 'SGD', 'S$'],
  ['CA', 'Canada', 'CAD', 'C$'],
  ['AU', 'Australia', 'AUD', 'A$'],
  ['BR', 'Brazil', 'BRL', 'R$'],
  ['ZA', 'South Africa', 'ZAR', 'R'],
];

export const defaultMonetizationState = {
  country: 'IN',
  currency: 'INR',
  connectedPaymentMethod: '',
  subscriptionTiers: [
    {
      id: 'basic',
      name: 'Basic',
      monthly: 49,
      annual: 499,
      enabled: true,
      features: ['Exclusive posts', 'Subscriber badge'],
    },
    {
      id: 'supporter',
      name: 'Supporter',
      monthly: 149,
      annual: 1499,
      enabled: false,
      features: ['Private stories', 'Early access'],
    },
    {
      id: 'premium',
      name: 'Premium',
      monthly: 399,
      annual: 3999,
      enabled: false,
      features: ['Private reels', 'Private chats', 'Community access'],
    },
  ],
  enabledPaidFeatures: {},
};

function readState() {
  if (typeof window === 'undefined') {
    return { ...defaultMonetizationState };
  }

  try {
    const saved = window.localStorage.getItem(MONETIZATION_KEY);

    return saved
      ? {
          ...defaultMonetizationState,
          ...JSON.parse(saved),
        }
      : { ...defaultMonetizationState };
  } catch {
    return { ...defaultMonetizationState };
  }
}

function saveState(state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(MONETIZATION_KEY, JSON.stringify(state));
  }
}

export function getMonetizationState() {
  return readState();
}

export function updateMonetizationState(updates) {
  const next = {
    ...readState(),
    ...updates,
  };

  saveState(next);
  return next;
}

export function updateSubscriptionTier(id, updates) {
  const state = readState();

  const next = {
    ...state,
    subscriptionTiers: state.subscriptionTiers.map((tier) =>
      tier.id === id ? { ...tier, ...updates } : tier
    ),
  };

  saveState(next);
  return next;
}

export function togglePaidFeature(id) {
  const state = readState();

  const next = {
    ...state,
    enabledPaidFeatures: {
      ...state.enabledPaidFeatures,
      [id]: !state.enabledPaidFeatures[id],
    },
  };

  saveState(next);
  return next;
}

export function formatMoney(value, currency = 'INR', locale = 'en-IN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(value);
}

export function getCurrencyForCountry(countryCode) {
  return (
    currencies.find(([code]) => code === countryCode)?.[2] || 'INR'
  );
}

export function getRevenueBreakdown(amount) {
  const creatorShare = amount * 0.7;
  const platformShare = amount * 0.2;
  const tax = amount * 0.05;
  const processingFee = amount * 0.05;

  return {
    gross: amount,
    creatorShare,
    platformShare,
    tax,
    processingFee,
  };
}

export default {
  currencies,
  defaultMonetizationState,
  getMonetizationState,
  updateMonetizationState,
  updateSubscriptionTier,
  togglePaidFeature,
  formatMoney,
  getCurrencyForCountry,
  getRevenueBreakdown,
};