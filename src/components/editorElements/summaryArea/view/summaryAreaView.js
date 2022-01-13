import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
// Constants

// Components
// Styles
import styles from './summaryAreaStyles';
import globalStyles from '../../../../globalStyles';

export default class SummaryAreaView extends PureComponent {
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
    const { summary } = this.props;

    return (
      <View style={globalStyles.containerHorizontal16}>
        <Text style={[styles.summaryText, this.props.style]}>{summary}</Text>
      </View>
    );
  }
}
