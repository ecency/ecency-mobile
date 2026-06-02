import AsyncStorage from '@react-native-async-storage/async-storage';
import getLocale from './getLocale';
import { locales } from '../config/locales';
import { setLanguage } from '../redux/actions/applicationActions';

const GUARD_KEY = 'locale_auto_detected';

/**
 * Map a device locale (e.g. "de_DE", "pt-BR", "en") to a REGISTERED app locale
 * code (e.g. "de-DE", "pt-PT", "en-US"), or null when nothing matches. Mapping
 * to a registered locale is required so IntlProvider/flattenMessages never
 * receives an unknown locale (which would crash).
 */
export const mapToRegisteredLocale = (deviceLocale: string): string | null => {
  if (!deviceLocale) {
    return null;
  }
  const norm = deviceLocale.replace('_', '-').toLowerCase();
  const ids = locales.map((l) => l.id);
  const exact = ids.find((id) => id.toLowerCase() === norm);
  if (exact) {
    return exact;
  }
  const base = norm.split('-')[0];
  return ids.find((id) => id.split('-')[0].toLowerCase() === base) || null;
};

/**
 * One-time, first-launch locale auto-detection. Only runs when the user has no
 * explicit language preference yet (still on the en-US default and never
 * detected before), so it never overrides a manual choice. Best-effort — it
 * never blocks app start, and only ever sets a registered locale.
 */
export const autoDetectLocale = async (dispatch: any, currentLanguage: string) => {
  try {
    const alreadyDetected = await AsyncStorage.getItem(GUARD_KEY);
    if (alreadyDetected || currentLanguage !== 'en-US') {
      return;
    }
    await AsyncStorage.setItem(GUARD_KEY, '1');
    const mapped = mapToRegisteredLocale(getLocale());
    if (mapped && mapped !== 'en-US') {
      dispatch(setLanguage(mapped));
    }
  } catch (_err) {
    // Auto-detection is best-effort; failures must never block app startup.
  }
};
