import React, { PureComponent } from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import * as Animatable from 'react-native-animatable';
// Constants

// Components
import { LineBreak } from '../../basicUIElements';
// Styles
import styles from './loginHeaderStyles';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import { IconButton } from '../..';

class LoginHeaderView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { string }    title            - Title for header string.
   *   @prop { string }    description      - Description for header string.
   *
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { description, isKeyboardOpen, title, onBackPress } = this.props;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View styles={styles.container}>
          <View style={styles.headerRow}>
            <View style={styles.backIconContainer}>
              <IconButton
                iconStyle={styles.backIcon}
                iconType="MaterialIcons"
                name="close"
                onPress={onBackPress}
              />
            </View>
          </View>
          <Animatable.View
            animation={isKeyboardOpen ? hideAnimation : showAnimation}
            duration={300}
          >
            <View style={styles.body}>
              <View style={styles.titleText}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
              <View style={styles.mascotContainer}>
                <Image
                  resizeMode="contain"
                  style={styles.mascot}
                  source={require('../../../assets/ecency_logo_transparent.png')}
                />
              </View>
            </View>
          </Animatable.View>
          <LineBreak />
        </View>
      </SafeAreaView>
    );
  }
}

export default LoginHeaderView;

const { height } = getWindowDimensions();
const bodyHeight = height / 3.9;
const showAnimation = {
  from: {
    opacity: 0,
    height: 0,
  },
  to: {
    opacity: 1,
    height: bodyHeight,
  },
};

const hideAnimation = {
  from: {
    opacity: 1,
    height: bodyHeight,
  },
  to: {
    opacity: 0,
    height: 0,
  },
};
