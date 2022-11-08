import * as React from 'react';
import { useIntl } from 'react-intl';
import { Alert, Text, View } from 'react-native';
import { useSnippetDeleteMutation } from '../../providers/queries';
import IconButton from '../iconButton';
import styles from './snippetsModalStyles';

interface SnippetItemProps {
  id: string | null;
  title: string;
  body: string;
  index: number;
  onEditPress: () => void;
}

const SnippetItem = ({ id, title, body, index, onEditPress }: SnippetItemProps) => {
  const intl = useIntl();
  const snippetsDeleteMutation = useSnippetDeleteMutation();

  const _onRemovePress = () => {
    // asks for remvoe confirmation and run remove routing upon confirming
    if (id) {
      Alert.alert(
        intl.formatMessage({ id: 'snippets.title_remove_confirmation' }),
        intl.formatMessage({ id: 'snippets.message_remove_confirmation' }),
        [
          {
            text: intl.formatMessage({ id: 'snippets.btn_cancel' }),
            style: 'cancel',
          },
          {
            text: intl.formatMessage({ id: 'snippets.btn_confirm' }),
            onPress: () => snippetsDeleteMutation.mutate(id),
          },
        ],
      );
    }
  };

  return (
    <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <View style={styles.itemHeader}>
        <Text style={styles.title} numberOfLines={1}>{`${title}`}</Text>
        {id && (
          <>
            <IconButton
              iconStyle={styles.itemIcon}
              style={styles.itemIconWrapper}
              iconType="MaterialCommunityIcons"
              name="pencil"
              onPress={onEditPress}
              size={20}
            />
            <IconButton
              iconStyle={styles.itemIcon}
              style={styles.itemIconWrapper}
              isLoading={snippetsDeleteMutation.isLoading}
              iconType="MaterialCommunityIcons"
              name="delete"
              onPress={_onRemovePress}
              size={20}
            />
          </>
        )}
      </View>

      <Text style={styles.body} numberOfLines={2} ellipsizeMode="tail">{`${body}`}</Text>
    </View>
  );
};

export default SnippetItem;
