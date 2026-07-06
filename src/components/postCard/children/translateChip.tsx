import React from 'react';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';

import { TextWithIcon } from '../../basicUIElements';
import { useContentLanguageGate } from '../../../hooks/useContentLanguageGate';
import { languageDisplayName } from '../../../utils/iso639';
import { SheetNames } from '../../../navigation/sheets';
import styles from '../styles/postCard.styles';

interface Props {
  content: any;
}

/**
 * Compact Translate chip for feed cards, shown only when the detected content
 * language differs from the reader's. Feed-safe: detection is franc-only (no
 * server call), idle-scheduled and memoized per permlink by the gate hook.
 * Tapping opens the existing translate sheet pre-targeted to the reader's
 * language (source stays "auto" so the backend picks the real source).
 */
const TranslateChipComponent = ({ content }: Props) => {
  const intl = useIntl();
  const decision = useContentLanguageGate(content, { serverConfirm: false });

  if (!decision?.show) {
    return null;
  }

  const _onPress = () => {
    SheetManager.show(SheetNames.POST_TRANSLATION, {
      payload: { content, initialTargetCode: decision.target },
    });
  };

  return (
    <TextWithIcon
      iconName="translate"
      iconStyle={styles.commentIcon}
      iconType="MaterialIcons"
      isClickable
      onPress={_onPress}
      accessibilityLabel={intl.formatMessage(
        { id: 'post_translate.translate_to' },
        { lang: languageDisplayName(decision.target) },
      )}
    />
  );
};

export const TranslateChip = React.memo(
  TranslateChipComponent,
  (prev, next) => prev.content === next.content,
);
