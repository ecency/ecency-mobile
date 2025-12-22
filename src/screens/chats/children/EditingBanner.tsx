import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../../../components';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface EditingBannerProps {
  editingPostId: string | null;
  onCancelEdit: () => void;
}

export const EditingBanner: React.FC<EditingBannerProps> = React.memo(
  ({ editingPostId, onCancelEdit }) => {
    const intl = useIntl();

    if (!editingPostId) {
      return null;
    }

    return (
      <View style={styles.composerEditingBanner}>
        <Text style={styles.editingLabel}>
          {intl.formatMessage({ id: 'chats.editing_message', defaultMessage: 'Editing message' })}
        </Text>
        <TouchableOpacity onPress={onCancelEdit} style={styles.cancelEditButton}>
          <Icon
            name="close"
            iconType="MaterialCommunityIcons"
            size={18}
            color={EStyleSheet.value('$primaryDarkText')}
          />
        </TouchableOpacity>
      </View>
    );
  },
);

EditingBanner.displayName = 'EditingBanner';
