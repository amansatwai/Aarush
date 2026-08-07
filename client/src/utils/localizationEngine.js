const STORAGE_KEY = 'aarush_localization_preferences';

export const languages = [
  ['en', 'English', 'English', 'Latin', 'Active'],
  ['hi', 'हिन्दी', 'Hindi', 'Devanagari', 'Active'],
  ['ur', 'اردو', 'Urdu', 'Arabic', 'Active'],
  ['bn', 'বাংলা', 'Bengali', 'Bengali', 'Active'],
  ['pa', 'ਪੰਜਾਬੀ', 'Punjabi', 'Gurmukhi', 'Active'],
  ['gu', 'ગુજરાતી', 'Gujarati', 'Gujarati', 'Active'],
  ['mr', 'मराठी', 'Marathi', 'Devanagari', 'Active'],
  ['ta', 'தமிழ்', 'Tamil', 'Tamil', 'Active'],
  ['te', 'తెలుగు', 'Telugu', 'Telugu', 'Active'],
  ['kn', 'ಕನ್ನಡ', 'Kannada', 'Kannada', 'Active'],
  ['ml', 'മലയാളം', 'Malayalam', 'Malayalam', 'Active'],
  ['ar', 'العربية', 'Arabic', 'Arabic', 'Active'],
  ['fr', 'Français', 'French', 'Latin', 'Active'],
  ['de', 'Deutsch', 'German', 'Latin', 'Active'],
  ['es', 'Español', 'Spanish', 'Latin', 'Active'],
  ['pt', 'Português', 'Portuguese', 'Latin', 'Active'],
  ['ru', 'Русский', 'Russian', 'Cyrillic', 'Active'],
  ['zh-CN', '简体中文', 'Chinese (Simplified)', 'Han', 'Active'],
  ['zh-TW', '繁體中文', 'Chinese (Traditional)', 'Han', 'Active'],
  ['ja', '日本語', 'Japanese', 'Japanese', 'Active'],
  ['ko', '한국어', 'Korean', 'Hangul', 'Active'],
  ['tr', 'Türkçe', 'Turkish', 'Latin', 'Active'],
  ['id', 'Bahasa Indonesia', 'Indonesian', 'Latin', 'Active'],
  ['th', 'ไทย', 'Thai', 'Thai', 'Active'],
  ['vi', 'Tiếng Việt', 'Vietnamese', 'Latin', 'Active'],
  ['it', 'Italiano', 'Italian', 'Latin', 'Active'],
  ['nl', 'Nederlands', 'Dutch', 'Latin', 'Active'],
  ['pl', 'Polski', 'Polish', 'Latin', 'Active'],
  ['uk', 'Українська', 'Ukrainian', 'Cyrillic', 'Active'],
  ['fa', 'فارسی', 'Persian', 'Arabic', 'Active'],
  ['he', 'עברית', 'Hebrew', 'Hebrew', 'Active'],
  ['sw', 'Kiswahili', 'Swahili', 'Latin', 'Active'],
  ['ne', 'नेपाली', 'Nepali', 'Devanagari', 'Active'],
  ['si', 'සිංහල', 'Sinhala', 'Sinhala', 'Active'],
];

export const countries = [
  ['IN', '🇮🇳', 'India', '+91', 'Asia/Kolkata', 'INR', 'Metric', 'Monday'],
  ['US', '🇺🇸', 'United States', '+1', 'America/New_York', 'USD', 'Imperial', 'Sunday'],
  ['GB', '🇬🇧', 'United Kingdom', '+44', 'Europe/London', 'GBP', 'Metric', 'Monday'],
  ['JP', '🇯🇵', 'Japan', '+81', 'Asia/Tokyo', 'JPY', 'Metric', 'Monday'],
  ['DE', '🇩🇪', 'Germany', '+49', 'Europe/Berlin', 'EUR', 'Metric', 'Monday'],
  ['FR', '🇫🇷', 'France', '+33', 'Europe/Paris', 'EUR', 'Metric', 'Monday'],
  ['CA', '🇨🇦', 'Canada', '+1', 'America/Toronto', 'CAD', 'Metric', 'Sunday'],
  ['AU', '🇦🇺', 'Australia', '+61', 'Australia/Sydney', 'AUD', 'Metric', 'Monday'],
  ['AE', '🇦🇪', 'United Arab Emirates', '+971', 'Asia/Dubai', 'AED', 'Metric', 'Sunday'],
  ['SA', '🇸🇦', 'Saudi Arabia', '+966', 'Asia/Riyadh', 'SAR', 'Metric', 'Sunday'],
  ['SG', '🇸🇬', 'Singapore', '+65', 'Asia/Singapore', 'SGD', 'Metric', 'Monday'],
  ['BR', '🇧🇷', 'Brazil', '+55', 'America/Sao_Paulo', 'BRL', 'Metric', 'Sunday'],
  ['ZA', '🇿🇦', 'South Africa', '+27', 'Africa/Johannesburg', 'ZAR', 'Metric', 'Sunday'],
];

export const writingStyles = [
  'Formal',
  'Casual',
  'Friendly',
  'Professional',
  'Romantic',
  'Funny',
  'Minimal',
  'Stylish',
  'Luxury',
  'Aesthetic',
  'Gen Z',
  'Traditional',
  'Corporate',
  'Creator',
  'Influencer',
  'Storytelling',
  'Short',
  'Detailed',
];

export const translationModules = [
  'Chat Translation',
  'Story Translation',
  'Post Translation',
  'Reel Caption Translation',
  'Voice Translation',
  'Image Text Translation',
  'Camera Translation',
  'Offline Translation Pack',
];

export const wallpaperStyles = [
  'Dark Aesthetic',
  'Nature',
  'Galaxy',
  'Cyberpunk',
  'Luxury',
  'Minimal',
  'Anime',
  'Abstract',
  'Forest',
  'Mountains',
  'Rain',
  'Neon',
  'Space',
];

export const accessibilityOptions = [
  ['largeText', 'Large Text', 'Increase readable text size.'],
  ['extraLargeText', 'Extra Large Text', 'Use maximum supported text sizing.'],
  ['highContrast', 'High Contrast', 'Increase contrast between content and backgrounds.'],
  ['darkMode', 'Dark Mode', 'Use the Aarush dark theme.'],
  ['lightMode', 'Light Mode', 'Use a light presentation theme.'],
  ['systemTheme', 'System Theme', 'Follow the operating system theme.'],
  ['colorBlind', 'Color Blind Modes', 'Adjust color presentation for color vision differences.'],
  ['reducedMotion', 'Reduced Motion', 'Reduce animation and transition effects.'],
  ['screenReader', 'Screen Reader Support', 'Improve labels and announcements for assistive technology.'],
  ['voiceNavigation', 'Voice Navigation', 'Prepare voice-based navigation controls.'],
  ['voiceCommands', 'Voice Commands', 'Prepare command-based interactions.'],
  ['haptics', 'Haptic Feedback', 'Use supported vibration feedback.'],
  ['largeButtons', 'Button Size', 'Increase interactive target sizes.'],
  ['touchSensitivity', 'Touch Sensitivity', 'Adjust touch interaction tolerance.'],
  ['oneHanded', 'One-Handed Mode', 'Move controls into a reachable layout.'],
  ['readingFocus', 'Reading Focus Mode', 'Reduce visual distractions while reading.'],
  ['dyslexiaFont', 'Dyslexia-Friendly Font', 'Use a more readable font configuration.'],
  ['keyboardNavigation', 'Keyboard Navigation', 'Support keyboard-only navigation.'],
  ['captions', 'Captions & Subtitles', 'Display spoken content as text.'],
  ['audioDescriptions', 'Audio Descriptions', 'Prepare descriptions for visual content.'],
];

export function getPreferences() {
  if (typeof window === 'undefined') {
    return {
      language: 'en',
      country: 'IN',
      style: 'Friendly',
      wallpaper: 'Dark Aesthetic',
      accessibility: {},
    };
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ||
        JSON.stringify({
          language: 'en',
          country: 'IN',
          style: 'Friendly',
          wallpaper: 'Dark Aesthetic',
          accessibility: {},
        })
    );
  } catch {
    return {
      language: 'en',
      country: 'IN',
      style: 'Friendly',
      wallpaper: 'Dark Aesthetic',
      accessibility: {},
    };
  }
}

export function savePreferences(preferences) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }
}

export function getLanguage(code) {
  return languages.find((language) => language[0] === code) || languages[0];
}

export function getCountry(code) {
  return countries.find((country) => country[0] === code) || countries[0];
}

export function formatNumber(value, locale = 'en-IN') {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(value, locale = 'en-IN') {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function formatCurrency(value, currency = 'INR', locale = 'en-IN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

export function getDirection(languageCode) {
  return ['ar', 'fa', 'he', 'ur'].includes(languageCode) ? 'rtl' : 'ltr';
}

export default {
  languages,
  countries,
  writingStyles,
  translationModules,
  wallpaperStyles,
  accessibilityOptions,
  getPreferences,
  savePreferences,
  getLanguage,
  getCountry,
  formatNumber,
  formatDate,
  formatCurrency,
  getDirection,
};