import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { useIntl } from 'react-intl';
import { Icon } from '../icon';
import { useIsProMember } from '../../providers/queries';
import styles from './proBadgeStyles';

interface ProBadgeProps {
  username?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * X-style verified checkmark rendered next to a username when that user is an
 * Ecency Pro member. Renders nothing for non-Pro users, so it is safe to drop
 * beside any author/username without extra guards.
 */
const ProBadge = ({ username, size = 15, style }: ProBadgeProps) => {
  const intl = useIntl();
  const isPro = useIsProMember(username);

  if (!isPro) {
    return null;
  }

  return (
    <Icon
      iconType="MaterialCommunityIcons"
      name="check-decagram"
      size={size}
      style={[styles.badge, style]}
      accessibilityLabel={intl.formatMessage({
        id: 'pro.badge_a11y',
        defaultMessage: 'Ecency Pro member',
      })}
    />
  );
};

export default ProBadge;
