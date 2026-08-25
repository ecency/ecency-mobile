import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Clipboard from '@react-native-clipboard/clipboard';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getNewsletterSenderQueryOptions } from '@ecency/sdk';
import ROUTES from '../../constants/routeNames';
import { useAppDispatch, useAuth } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import { IconButton } from '../iconButton';

interface Props {
  username: string;
}

/**
 * The creator's own list at a glance on their profile (web parity,
 * vision-mobile#3520): weekly/monthly mailable subscriber counts, the
 * copyable subscribe link, and the way into digest management. The sender
 * view is gated to the list owner server-side, so this mounts only on the
 * own profile and stays silent while the lookup is unresolved or refused.
 */
const NewsletterSenderInfo = ({ username }: Props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { username: authUsername, code } = useAuth();

  const senderQuery = useQuery(
    getNewsletterSenderQueryOptions('creator', username, authUsername, code),
  );

  const subscribers = senderQuery.data?.subscribers;
  if (!subscribers) {
    return null;
  }

  const _handleCopyLink = () => {
    Clipboard.setString(`https://ecency.com/@${username}?subscribe=digest`);
    dispatch(toastNotification(intl.formatMessage({ id: 'alert.copied' })));
  };

  return (
    <View style={styles.row}>
      <Text style={styles.countText}>
        {intl.formatMessage(
          { id: 'newsletter.subscriber_count' },
          { weekly: subscribers.weekly ?? 0, monthly: subscribers.monthly ?? 0 },
        )}
      </Text>
      <IconButton
        iconType="MaterialCommunityIcons"
        name="link-variant"
        size={18}
        color={EStyleSheet.value('$primaryDarkGray')}
        onPress={_handleCopyLink}
      />
      <TouchableOpacity onPress={() => navigation.navigate(ROUTES.SCREENS.EMAIL_DIGESTS)}>
        <Text style={styles.manageText}>{intl.formatMessage({ id: 'newsletter.manage' })}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = EStyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  countText: {
    fontSize: 13,
    color: '$primaryDarkGray',
  },
  manageText: {
    fontSize: 13,
    color: '$primaryBlue',
    marginLeft: 8,
  },
});

export default NewsletterSenderInfo;
