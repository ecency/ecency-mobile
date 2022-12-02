import { View, Text } from 'react-native';
import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import styles from '../styles/manageAssets.styles';
import { TokensSelectModal } from './tokensSelectModal';
import { Icon } from '../../../components';
import { TouchableOpacity } from 'react-native-gesture-handler';


export interface Props { };

export const ManageAssets = ({ }: Props) => {
  const intl = useIntl();

  const tokensSelectRef = useRef(null);

  const _onManagePress = () => {
    if (tokensSelectRef.current) {
      tokensSelectRef.current.showModal();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={_onManagePress}>
      <View style={styles.headerWrapper}>
        <Icon
          style={styles.rightIcon}
          iconType="MaterialCommunityIcons"
          size={16}
          name="pencil"/>
         <Text style={styles.title}>{intl.formatMessage({ id: 'wallet.manage_assets' })}</Text>
      </View>
      <TokensSelectModal ref={tokensSelectRef} />
    </TouchableOpacity>
  );
};
