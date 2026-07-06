/**
 * Pure language helpers for the "translate when the reader's language differs
 * from the content" feature. No React Native imports — unit-testable.
 *
 * franc-min (the client-side detector) emits ISO-639-3 codes; LibreTranslate
 * (translate.ecency.com) speaks ISO-639-1. Our instance exposes 43 languages
 * and every source can translate to every target (all-to-all), so a CTA is
 * valid whenever the detected source and the reader target are both supported
 * and differ.
 *
 * Mirrors the web app's features/shared/entry-translate/iso639.ts. NOTE: mobile
 * uses franc-min@5 (CommonJS — safe for Metro/Hermes/jest), which emits "fas"
 * for Persian, whereas web's franc-min@6 emits "pes". Both are mapped here.
 */

export const LIBRETRANSLATE_CODES = [
  'ar',
  'az',
  'bg',
  'bn',
  'ca',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'eo',
  'es',
  'et',
  'fa',
  'fi',
  'fr',
  'ga',
  'he',
  'hi',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'lt',
  'lv',
  'ms',
  'nb',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sq',
  'sv',
  'th',
  'tl',
  'tr',
  'uk',
  'zh',
  'zt',
];

export const LIBRETRANSLATE_SOURCES = new Set<string>(LIBRETRANSLATE_CODES);
export const LIBRETRANSLATE_TARGETS = new Set<string>(LIBRETRANSLATE_CODES);

// ISO-639-3 (franc-min output) -> ISO-639-1 (LibreTranslate). Verified against
// the installed franc-min@5 data. Both "pes" (v6) and "fas" (v5) map to fa so
// this table is correct regardless of the installed franc-min major.
export const ISO_639_3_TO_1: Record<string, string> = {
  arb: 'ar',
  azj: 'az',
  bul: 'bg',
  ben: 'bn',
  cmn: 'zh',
  ces: 'cs',
  deu: 'de',
  ell: 'el',
  eng: 'en',
  spa: 'es',
  pes: 'fa',
  fas: 'fa',
  fra: 'fr',
  hin: 'hi',
  hun: 'hu',
  ind: 'id',
  ita: 'it',
  jpn: 'ja',
  kor: 'ko',
  nld: 'nl',
  pol: 'pl',
  por: 'pt',
  ron: 'ro',
  rus: 'ru',
  swe: 'sv',
  tgl: 'tl',
  tha: 'th',
  tur: 'tr',
  ukr: 'uk',
  zlm: 'ms',
};

export function francToIso1(code3: string | null | undefined): string | null {
  if (!code3 || code3 === 'und') {
    return null;
  }
  return ISO_639_3_TO_1[code3] ?? null;
}

export function normLang(input: string | null | undefined): string {
  if (!input) {
    return '';
  }
  const lower = input.toLowerCase().replace(/_/g, '-');
  if (
    lower === 'zh-hant' ||
    lower.startsWith('zh-hant-') ||
    lower === 'zh-tw' ||
    lower === 'zh-hk' ||
    lower === 'zh-mo'
  ) {
    return 'zt';
  }
  // Norwegian macrolanguage ('no') and Nynorsk ('nn') -> LibreTranslate's
  // Bokmål ('nb'); device/app locales often report the generic 'no'.
  if (lower === 'no' || lower.startsWith('no-') || lower === 'nn' || lower.startsWith('nn-')) {
    return 'nb';
  }
  return lower.split('-')[0];
}

const RTL_LANGS = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'dv', 'yi']);

export function isRtlLang(code: string | null | undefined): boolean {
  return RTL_LANGS.has(normLang(code));
}

export const MIN_DETECT_CHARS = 40;

export interface TranslateCtaDecision {
  show: boolean;
  source: string;
  target: string;
}

export function resolveTranslateCta({
  detected,
  reader,
  textLength,
}: {
  detected: string | null | undefined;
  reader: string;
  textLength: number;
}): TranslateCtaDecision {
  const normDetected = detected ? normLang(detected) : null;
  const target = LIBRETRANSLATE_TARGETS.has(reader) ? reader : 'en';

  const show =
    textLength >= MIN_DETECT_CHARS &&
    !!normDetected &&
    normDetected !== 'und' &&
    LIBRETRANSLATE_SOURCES.has(normDetected) &&
    LIBRETRANSLATE_TARGETS.has(target) &&
    normDetected !== target;

  return { show, source: normDetected ?? '', target };
}

const DISPLAY_NAME_FALLBACK: Record<string, string> = {
  ar: 'Arabic',
  az: 'Azerbaijani',
  bg: 'Bulgarian',
  bn: 'Bengali',
  ca: 'Catalan',
  cs: 'Czech',
  da: 'Danish',
  de: 'German',
  el: 'Greek',
  en: 'English',
  eo: 'Esperanto',
  es: 'Spanish',
  et: 'Estonian',
  fa: 'Persian',
  fi: 'Finnish',
  fr: 'French',
  ga: 'Irish',
  he: 'Hebrew',
  hi: 'Hindi',
  hu: 'Hungarian',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  lt: 'Lithuanian',
  lv: 'Latvian',
  ms: 'Malay',
  nb: 'Norwegian',
  nl: 'Dutch',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sk: 'Slovak',
  sl: 'Slovenian',
  sq: 'Albanian',
  sv: 'Swedish',
  th: 'Thai',
  tl: 'Tagalog',
  tr: 'Turkish',
  uk: 'Ukrainian',
  zh: 'Chinese',
  zt: 'Chinese (Traditional)',
};

/**
 * Human-readable language name. Prefers a static English label (Hermes lacks
 * reliable Intl.DisplayNames); falls back to Intl only when the map misses.
 * When `uiLang` is passed the order flips: Intl is tried first so the name
 * comes out localized (e.g. a target-language heading), with the static
 * English label as the fallback.
 */
export function languageDisplayName(code: string, uiLang?: string): string {
  const norm = normLang(code);
  if (!uiLang && DISPLAY_NAME_FALLBACK[norm]) {
    return DISPLAY_NAME_FALLBACK[norm];
  }
  try {
    const AnyIntl = Intl as any;
    if (AnyIntl && typeof AnyIntl.DisplayNames === 'function') {
      const dn = new AnyIntl.DisplayNames(uiLang ? [uiLang, 'en'] : ['en'], { type: 'language' });
      const name = dn.of(norm === 'zt' ? 'zh-Hant' : norm);
      if (name && name.toLowerCase() !== norm) {
        return norm === 'zt' && uiLang ? `${name} (Traditional)` : name;
      }
    }
  } catch {
    // ignore
  }
  return DISPLAY_NAME_FALLBACK[norm] ?? code;
}
