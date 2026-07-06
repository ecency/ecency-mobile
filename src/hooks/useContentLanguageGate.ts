import { useEffect, useState } from 'react';
import { Platform, InteractionManager } from 'react-native';
import { useSelector } from 'react-redux';
import { postBodySummary } from '@ecency/render-helper';
import { detectLanguage } from '../providers/translation/translation';
import getLocale from '../utils/getLocale';
import { selectLanguage } from '../redux/selectors';
import {
  francToIso1,
  LIBRETRANSLATE_TARGETS,
  MIN_DETECT_CHARS,
  normLang,
  resolveTranslateCta,
  TranslateCtaDecision,
} from '../utils/iso639';

const SAMPLE_CHARS = 600;
const RAW_SAMPLE_CHARS = 2000;

interface CacheEntry {
  lang: string | null;
  confirmed: boolean;
}

// Module-scoped, keyed by `${author}/${permlink}`. Survives component remounts
// (FlashList header/row churn) so detection and any /detect call happen at most
// once per post for the whole session.
const contentLangCache = new Map<string, CacheEntry>();

function resolveReaderLang(appLang: string): string {
  const candidates = [appLang, getLocale()];
  // eslint-disable-next-line no-restricted-syntax
  for (const candidate of candidates) {
    const norm = normLang(candidate);
    if (norm && LIBRETRANSLATE_TARGETS.has(norm)) {
      return norm;
    }
  }
  return 'en';
}

interface GatePost {
  author?: string;
  permlink?: string;
  body?: string;
}

interface GateOptions {
  // Full-post view only: confirm the on-device guess with the server /detect
  // endpoint. NEVER enable for feed/wave chips (would fan out a call per item).
  serverConfirm?: boolean;
}

/**
 * Decide whether to offer a "Translate to <reader>" CTA for a post, comparing
 * the reader's language (app language, then device locale) to the detected
 * content language. Returns null until resolved; fails closed on any error.
 *
 * Feed-safe: only a cheap length check + Map lookup run synchronously. The
 * markdown render + franc detection run once per permlink, after interactions,
 * on a cache miss. franc-min@5 is CommonJS so it is required synchronously (no
 * dynamic import / ESM concerns on Hermes).
 */
export function useContentLanguageGate(
  post: GatePost | null | undefined,
  { serverConfirm = false }: GateOptions = {},
): TranslateCtaDecision | null {
  const appLang = useSelector(selectLanguage);
  const [decision, setDecision] = useState<TranslateCtaDecision | null>(null);

  const author = post?.author;
  const permlink = post?.permlink;
  const body = post?.body;

  useEffect(() => {
    setDecision(null);

    if (!author || !permlink || !body || body.trim().length < MIN_DETECT_CHARS) {
      return undefined;
    }

    let cancelled = false;
    const key = `${author}/${permlink}`;
    const reader = resolveReaderLang(appLang);

    const cached = contentLangCache.get(key);
    if (cached && (cached.confirmed || !serverConfirm)) {
      setDecision(
        resolveTranslateCta({ detected: cached.lang, reader, textLength: MIN_DETECT_CHARS }),
      );
      return undefined;
    }

    const task = InteractionManager.runAfterInteractions(async () => {
      if (cancelled) {
        return;
      }
      try {
        const sample = postBodySummary(
          body.slice(0, RAW_SAMPLE_CHARS),
          0,
          Platform.OS as any,
        ).slice(0, SAMPLE_CHARS);
        const textLength = sample.trim().length;
        if (textLength < MIN_DETECT_CHARS) {
          contentLangCache.set(key, { lang: null, confirmed: true });
          return;
        }

        let lang: string | null = cached?.lang ?? null;
        let confirmed = cached?.confirmed ?? false;

        if (!cached) {
          // franc-min@5 is CommonJS; its default export is the detector function.
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const franc = require('franc-min');
          lang = francToIso1(franc(sample));
        }

        if (lang && lang === reader) {
          confirmed = true;
        } else if (serverConfirm) {
          try {
            const detected = await detectLanguage(sample);
            if (cancelled) {
              return;
            }
            const top = detected[0];
            if (top && typeof top.language === 'string') {
              lang = normLang(top.language);
              confirmed = true;
            }
          } catch {
            // /detect unreachable — keep the franc guess.
          }
        }

        contentLangCache.set(key, { lang, confirmed });
        if (!cancelled) {
          setDecision(resolveTranslateCta({ detected: lang, reader, textLength }));
        }
      } catch {
        if (!cancelled) {
          setDecision(null);
        }
      }
    });

    return () => {
      cancelled = true;
      task?.cancel?.();
    };
  }, [author, permlink, body, serverConfirm, appLang]);

  return decision;
}
