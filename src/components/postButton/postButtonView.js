import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../icon';

// Constant
import { default as ROUTES } from '../../constants/routeNames';
import scalePx from '../../utils/scalePx';

const PostButtonView = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate({
          name: ROUTES.SCREENS.EDITOR,
          key: 'editor_post',
        })
      }
      activeOpacity={1}
    >
      <Icon
        iconType="MaterialCommunityIcons"
        style={{ padding: 15 }}
        name="pencil"
        color="#c1c5c7"
        size={scalePx(26)}
      />
    </TouchableOpacity>
  );
};

export default PostButtonView;
