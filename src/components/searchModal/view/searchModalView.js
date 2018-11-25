import React, { Component, Fragment } from 'react';
import { View, Text, TextInput } from 'react-native';

// Constants

// Components
import { Icon } from '../../icon';
import { IconButton } from '../../iconButton';
import { Modal } from '../..';

// Styles
// eslint-disable-next-line
import styles from './searchModalStyles';

class SearchModalView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { isOpen, handleOnClose } = this.props;

    return (
      <Fragment>
        <Modal isOpen={isOpen} isFullScreen swipeToClose backButtonClose isTransparent>
          <View style={styles.container}>
            <View style={styles.inputWrapper}>
              <Icon style={styles.icon} iconType="FontAwesome" name="search" size={20} />
              <TextInput
                style={styles.input}
                onChangeText={text => this.setState({ text })}
                value={this.state.text}
              />
              <IconButton
                iconStyle={styles.closeIcon}
                iconType="FontAwesome"
                style={styles.closeIconButton}
                name="close"
                onPress={() => handleOnClose()}
              />
            </View>
            <View style={styles.body}>
              <Text style={{ color: 'white' }}> @result Test</Text>
            </View>
          </View>
        </Modal>
      </Fragment>
    );
  }
}

export default SearchModalView;
