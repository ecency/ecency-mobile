import * as React from 'react';
import { useIntl } from 'react-intl';
import { Text, View, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { View as AnimatedView } from 'react-native-animatable';
import { IconButton } from '../..';
import styles from './tabbedPostsStyles';

interface ScrollTopPopupProps {
  onPress: () => void;
  onClose: () => void;
  popupAvatars: string[];
  enableScrollTop: boolean;
}

const ScrollTopPopup = ({
  onPress,
  onClose,
  popupAvatars,
  enableScrollTop,
}: ScrollTopPopupProps) => {
  const intl = useIntl();

  if (popupAvatars.length == 0 && !enableScrollTop) {
    return null;
  }

  return (
    <AnimatedView style={styles.popupContainer} animation="zoomIn" duration={300}>
      <View style={styles.popupContentContainer}>
        <TouchableOpacity onPress={onPress}>
          <View style={styles.popupContentContainer}>
            <IconButton
              iconStyle={styles.arrowUpIcon}
              iconType="MaterialCommunityIcons"
              name="arrow-up"
              onPress={onPress}
              size={14}
            />

            {popupAvatars.map((url, index) => (
              <FastImage
                key={`image_bubble_${url}-${index}`}
                source={{ uri: url }}
                style={[styles.popupImage, { zIndex: 10 - index }]}
              />
            ))}

            {popupAvatars.length > 0 ? (
              <Text style={styles.postedText}>
                {intl.formatMessage({ id: 'home.popup_postfix' })}
              </Text>
            ) : (
              <Text style={styles.scrollTopText}>
                {intl.formatMessage({ id: 'home.scroll_top' })}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <IconButton
          iconStyle={styles.closeIcon}
          iconType="MaterialCommunityIcons"
          name="close"
          onPress={onClose}
          size={14}
        />
      </View>
    </AnimatedView>
  );
};

export default ScrollTopPopup;
