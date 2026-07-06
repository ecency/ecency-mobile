import {
  francToIso1,
  isRtlLang,
  ISO_639_3_TO_1,
  languageDisplayName,
  LIBRETRANSLATE_SOURCES,
  normLang,
  resolveTranslateCta,
} from './iso639';

describe('normLang', () => {
  it('reduces locale tags to a 2-letter code', () => {
    expect(normLang('en-US')).toBe('en');
    expect(normLang('pt_BR')).toBe('pt');
    expect(normLang('ES')).toBe('es');
  });

  it('maps Traditional Chinese variants to LibreTranslate zt', () => {
    expect(normLang('zh-Hant')).toBe('zt');
    expect(normLang('zh-TW')).toBe('zt');
    expect(normLang('zh-HK')).toBe('zt');
  });

  it('keeps Simplified Chinese as zh', () => {
    expect(normLang('zh')).toBe('zh');
    expect(normLang('zh-CN')).toBe('zh');
  });

  it('returns empty string for missing input', () => {
    expect(normLang('')).toBe('');
    expect(normLang(null)).toBe('');
    expect(normLang(undefined)).toBe('');
  });
});

describe('francToIso1', () => {
  it('maps franc ISO-639-3 codes (both fas and pes) to ISO-639-1', () => {
    expect(francToIso1('fas')).toBe('fa'); // franc-min@5 (mobile)
    expect(francToIso1('pes')).toBe('fa'); // franc-min@6 (web parity)
    expect(francToIso1('arb')).toBe('ar');
    expect(francToIso1('cmn')).toBe('zh');
    expect(francToIso1('zlm')).toBe('ms');
    expect(francToIso1('spa')).toBe('es');
  });

  it('returns null for und / unknown codes', () => {
    expect(francToIso1('und')).toBeNull();
    expect(francToIso1('')).toBeNull();
    expect(francToIso1(null)).toBeNull();
    expect(francToIso1('dan')).toBeNull();
  });

  it('every mapped target is a supported LibreTranslate source', () => {
    Object.values(ISO_639_3_TO_1).forEach((code1) => {
      expect(LIBRETRANSLATE_SOURCES.has(code1)).toBe(true);
    });
  });
});

describe('resolveTranslateCta', () => {
  const long = 200;

  it('shows when content and reader differ', () => {
    expect(resolveTranslateCta({ detected: 'es', reader: 'en', textLength: long })).toEqual({
      show: true,
      source: 'es',
      target: 'en',
    });
  });

  it('hides when content is the reader language', () => {
    expect(resolveTranslateCta({ detected: 'en', reader: 'en', textLength: long }).show).toBe(
      false,
    );
  });

  it('hides for short text', () => {
    expect(resolveTranslateCta({ detected: 'es', reader: 'en', textLength: 10 }).show).toBe(false);
  });

  it('hides for undetected / unsupported source', () => {
    expect(resolveTranslateCta({ detected: null, reader: 'en', textLength: long }).show).toBe(
      false,
    );
    expect(resolveTranslateCta({ detected: 'xx', reader: 'en', textLength: long }).show).toBe(
      false,
    );
  });

  it('falls back to English target when reader language unsupported', () => {
    const d = resolveTranslateCta({ detected: 'es', reader: 'xx', textLength: long });
    expect(d.target).toBe('en');
    expect(d.show).toBe(true);
  });
});

describe('isRtlLang', () => {
  it('flags RTL languages', () => {
    expect(isRtlLang('ar')).toBe(true);
    expect(isRtlLang('fa')).toBe(true);
    expect(isRtlLang('en')).toBe(false);
  });
});

describe('languageDisplayName', () => {
  it('produces readable names', () => {
    expect(languageDisplayName('es')).toBe('Spanish');
    expect(languageDisplayName('zt').toLowerCase()).toContain('traditional');
  });
});
