import AsyncStorage from '@react-native-async-storage/async-storage';
import getLocale from './getLocale';
import { VALUE as REGISTERED_LOCALES } from '../constants/options/language';
import { setLanguage } from '../redux/actions/applicationActions';

const GUARD_KEY = 'locale_auto_detected';

// Some platforms report legacy ISO-639 codes; normalize them to current ones.
const LEGACY_ALIASES: Record<string, string> = {
  iw: 'he', // Hebrew
  in: 'id', // Indonesian
  ji: 'yi', // Yiddish
};

/**
 * Map a device locale (e.g. "de_DE", "pt-BR", "zh-Hant-TW", "en") to a locale
 * that is BOTH registered and selectable (constants/options/language VALUE), or
 * null when nothing matches. Mapping to a known locale is required so
 * IntlProvider/flattenMessages never receives an unknown locale (which crashes).
 */
export const mapToRegisteredLocale = (deviceLocale: string): string | null => {
  if (!deviceLocale) {
    return null;
  }
  // Device locales may use "_" separators and arbitrary casing/script subtags.
  const norm = deviceLocale.replace(/_/g, '-').toLowerCase();
  const ids: readonly string[] = REGISTERED_LOCALES;
  const findById = (predicate: (id: string) => boolean) => ids.find(predicate) || null;

  // Exact match first (e.g. "pt-pt" -> "pt-PT").
  const exact = findById((id) => id.toLowerCase() === norm);
  if (exact) {
    return exact;
  }

  // Chinese: choose the script-appropriate variant before the generic "zh"
  // base fallback, otherwise Traditional users would wrongly get Simplified.
  if (norm.startsWith('zh')) {
    const wantsTraditional =
      norm.includes('hant') || ['tw', 'hk', 'mo'].some((r) => norm.includes(`-${r}`));
    const zh = findById((id) => id.toLowerCase() === (wantsTraditional ? 'zh-tw' : 'zh-cn'));
    if (zh) {
      return zh;
    }
  }

  // Base-language match, applying legacy code aliases (e.g. "iw" -> "he").
  const rawBase = norm.split('-')[0];
  const base = LEGACY_ALIASES[rawBase] || rawBase;
  return findById((id) => id.split('-')[0].toLowerCase() === base);
};

/**
 * One-time, first-launch locale auto-detection. Only runs when the user has no
 * explicit language preference yet (still on the en-US default and never
 * detected before), so it never overrides a manual choice. Best-effort — it
 * never blocks app start, and only ever sets a registered/selectable locale.
 */
export const autoDetectLocale = async (dispatch: any, currentLanguage: string) => {
  try {
    const alreadyDetected = await AsyncStorage.getItem(GUARD_KEY);
    if (alreadyDetected || currentLanguage !== 'en-US') {
      return;
    }
    const mapped = mapToRegisteredLocale(getLocale());
    if (mapped && mapped !== 'en-US') {
      dispatch(setLanguage(mapped));
    }
    // Persist the guard only AFTER dispatching the language, so a force-kill in the
    // gap re-runs detection next launch instead of locking the user on English.
    await AsyncStorage.setItem(GUARD_KEY, '1');
  } catch (_err) {
    // Auto-detection is best-effort; failures must never block app startup.
  }
};
