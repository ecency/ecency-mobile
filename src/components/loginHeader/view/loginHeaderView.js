import React, { PureComponent } from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
// Constants

// Components
import { TextButton } from '../../buttons';
import { LineBreak } from '../../basicUIElements';
// Styles
import styles from './loginHeaderStyles';

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
    const { description, isKeyboardOpen, onPress, rightButtonText, title } = this.props;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View styles={styles.container}>
          <View style={styles.headerRow}>
            <Image
              style={styles.logo}
              source={require('../../../assets/esteem_logo_transparent.png')}
            />
            <View style={styles.headerButton}>
              <TextButton onPress={onPress} text={rightButtonText} />
            </View>
          </View>
          {!isKeyboardOpen && (
            <View style={styles.body}>
              <View style={styles.titleText}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
              <Image style={styles.mascot} source={require('../../../assets/love_mascot.png')} />
            </View>
          )}
          <LineBreak />
        </View>
      </SafeAreaView>
    );
  }
}

export default LoginHeaderView;
