import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { SheetManager } from 'react-native-actions-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { postBodySummary } from '@ecency/render-helper';
import { Icon } from '../../icon';
import { useContentLanguageGate } from '../../../hooks/useContentLanguageGate';
import { isRtlLang, languageDisplayName, normLang } from '../../../utils/iso639';
import { translateLongText } from '../../../providers/translation/translation';
import { SheetNames } from '../../../navigation/sheets';

const DISMISS_PREFIX = '@translate-dismissed:';

interface Props {
  post: any;
  // Lifts the translated plain-text body to the parent (which renders it in
  // place of <PostBody>). Called with null to restore the original.
  onTranslate: (text: string | null, rtl?: boolean) => void;
}

const PostTranslateInlineComponent = ({ post, onTranslate }: Props) => {
  const intl = useIntl();
  const dismissKey = `${DISMISS_PREFIX}${post?.author}/${post?.permlink}`;

  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [fromLang, setFromLang] = useState('');
  const requestRef = useRef<{ canceled: boolean } | null>(null);

  const decision = useContentLanguageGate(post, { serverConfirm: true });

  useEffect(() => {
    // Reset per-post. postDisplayView reuses this component instance across posts
    // (it resets its own translatedBody on permlink change), so without this a new
    // post would inherit the previous post's "done"/fromLang and show a bogus
    // "Translated from X" with no Translate prompt.
    setStatus('idle');
    setFromLang('');
    setDismissed(false);
    if (requestRef.current) {
      requestRef.current.canceled = true;
    }
    let active = true;
    AsyncStorage.getItem(dismissKey).then((v) => {
      if (active) {
        setDismissed(!!v);
      }
    });
    return () => {
      active = false;
    };
  }, [dismissKey]);

  // Abort any in-flight translation on unmount.
  useEffect(
    () => () => {
      if (requestRef.current) {
        requestRef.current.canceled = true;
      }
    },
    [],
  );

  const handleTranslate = useCallback(async () => {
    if (!decision) {
      return;
    }
    setStatus('loading');
    const token = { canceled: false };
    requestRef.current = token;
    try {
      const text = postBodySummary(post.body, 0, Platform.OS as any);
      const res = await translateLongText(text, 'auto', decision.target);
      if (token.canceled) {
        return;
      }
      const detected = res.detectedLanguage?.language
        ? normLang(res.detectedLanguage.language)
        : decision.source;
      // Wrong instant guess — the body is actually the reader's language.
      if (detected && detected === decision.target) {
        AsyncStorage.setItem(dismissKey, '1');
        setDismissed(true);
        return;
      }
      setFromLang(detected || decision.source);
      onTranslate(res.translatedText, isRtlLang(decision.target));
      setStatus('done');
    } catch {
      if (!token.canceled) {
        setStatus('idle');
      }
    }
  }, [decision, post, dismissKey, onTranslate]);

  const handleShowOriginal = useCallback(() => {
    if (requestRef.current) {
      requestRef.current.canceled = true;
    }
    onTranslate(null);
    setStatus('idle');
  }, [onTranslate]);

  const handleDismiss = useCallback(() => {
    if (requestRef.current) {
      requestRef.current.canceled = true;
    }
    AsyncStorage.setItem(dismissKey, '1');
    setDismissed(true);
    onTranslate(null);
  }, [dismissKey, onTranslate]);

  const handleChangeLanguage = useCallback(() => {
    if (!decision) {
      return;
    }
    SheetManager.show(SheetNames.POST_TRANSLATION, {
      payload: { content: post, initialTargetCode: decision.target },
    });
  }, [decision, post]);

  if (dismissed || !decision?.show) {
    return null;
  }

  const targetName = languageDisplayName(decision.target);
  const sourceName = languageDisplayName(decision.source);

  return (
    <View style={styles.container}>
      <Icon
        iconType="MaterialIcons"
        name="translate"
        size={18}
        color={EStyleSheet.value('$primaryBlue')}
        style={styles.icon}
      />
      <Text style={styles.label} numberOfLines={2}>
        {status === 'done'
          ? intl.formatMessage(
              { id: 'post_translate.translated_from' },
              { lang: languageDisplayName(fromLang || decision.source) },
            )
          : intl.formatMessage(
              { id: 'post_translate.banner_detected' },
              { lang: sourceName, target: targetName },
            )}
      </Text>

      {status === 'idle' && (
        <TouchableOpacity onPress={handleTranslate} hitSlop={hitSlop}>
          <Text style={styles.action}>
            {intl.formatMessage({ id: 'post_translate.translate_to' }, { lang: targetName })}
          </Text>
        </TouchableOpacity>
      )}
      {status === 'loading' && <ActivityIndicator size="small" style={styles.spinner} />}
      {status === 'done' && (
        <TouchableOpacity onPress={handleShowOriginal} hitSlop={hitSlop}>
          <Text style={styles.action}>
            {intl.formatMessage({ id: 'post_translate.show_original' })}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleChangeLanguage} hitSlop={hitSlop}>
        <Text style={styles.action}>
          {intl.formatMessage({ id: 'post_translate.change_language' })}
        </Text>
      </TouchableOpacity>

      {status !== 'loading' && (
        <TouchableOpacity onPress={handleDismiss} hitSlop={hitSlop} style={styles.dismiss}>
          <Icon
            iconType="MaterialIcons"
            name="close"
            size={16}
            color={EStyleSheet.value('$iconColor')}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

const styles = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    backgroundColor: '$primaryLightBackground',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    flex: 1,
    minWidth: 120,
    fontSize: 13,
    color: '$primaryBlack',
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    color: '$primaryBlue',
    marginLeft: 12,
  },
  spinner: {
    marginLeft: 12,
  },
  dismiss: {
    marginLeft: 8,
  },
});

export const PostTranslateInline = memo(
  PostTranslateInlineComponent,
  (prev, next) =>
    prev.post?.author === next.post?.author &&
    prev.post?.permlink === next.post?.permlink &&
    prev.onTranslate === next.onTranslate,
);
