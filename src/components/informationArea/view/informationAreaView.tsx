import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ROUTES from '../../../constants/routeNames';

// Constants

// Components

// Styles
import styles from './informationAreaStyles';

const FormInputView = ({ description, iconName, bold, link }) => {
  const navigation = useNavigation();

  const _onPress = () => {
    navigation.navigate({
      name: ROUTES.SCREENS.WEB_BROWSER,
      params: {
        url: link,
      },
      key: link,
    });
  };

  return (
    <TouchableOpacity onPress={_onPress}>
      <View style={styles.container}>
        <Ionicons color="#c1c5c7" style={styles.infoIcon} name={iconName} />
        <Text style={[styles.infoText, bold && styles.bold]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default FormInputView;
