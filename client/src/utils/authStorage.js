const KEYS = {
  rememberMe: "aarush_remember_me",
  savedPassword: "aarush_saved_password",
  savedInfo: "aarush_saved_info",
  cachedAccount: "aarush_cached_account",
  accountSelection: "aarush_account_selection",
};

export function getRememberMe() {
  return localStorage.getItem(KEYS.rememberMe) === "true";
}

export function setRememberMe(value) {
  localStorage.setItem(KEYS.rememberMe, value ? "true" : "false");
}

export function savePassword(email, password) {
  localStorage.setItem(KEYS.savedPassword, JSON.stringify({ email, password }));
}

export function getSavedPassword() {
  const raw = localStorage.getItem(KEYS.savedPassword);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSavedPassword() {
  localStorage.removeItem(KEYS.savedPassword);
}

export function saveInformation(data) {
  localStorage.setItem(KEYS.savedInfo, JSON.stringify(data));
}

export function getSavedInformation() {
  const raw = localStorage.getItem(KEYS.savedInfo);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSavedInformation() {
  localStorage.removeItem(KEYS.savedInfo);
}

export function cacheAccount(account) {
  localStorage.setItem(KEYS.cachedAccount, JSON.stringify(account));
}

export function getCachedAccount() {
  const raw = localStorage.getItem(KEYS.cachedAccount);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCachedAccount() {
  localStorage.removeItem(KEYS.cachedAccount);
}

export function clearLocalAuthState() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  sessionStorage.clear();
}