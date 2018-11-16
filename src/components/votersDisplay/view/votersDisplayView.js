import React, { PureComponent } from 'react';
import {
  View, FlatList, Text, TouchableOpacity,
} from 'react-native';

// Constants

// Components
import FastImage from 'react-native-fast-image';

// Styles
// eslint-disable-next-line
import styles from './votersDisplayStyles';
// const DEFAULT_IMAGE = require('../../../../assets/esteem.png');

class VotersDisplayView extends PureComponent {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  // Component Functions
  _renderItem = (item, index) => {
    const { handleOnUserPress } = this.props;
    const reputation = `(${item.reputation})`;
    const value = `$ ${item.value}`;
    const percent = `${item.percent}%`;

    return (
      <View style={[styles.voteItemWrapper, index % 2 !== 0 && styles.voteItemWrapperGray]}>
        <TouchableOpacity onPress={() => handleOnUserPress(item.voter)}>
          <FastImage style={[styles.avatar]} source={{ uri: item.avatar }} />
        </TouchableOpacity>
        <View style={styles.userDescription}>
          <Text style={styles.name}>
            {item.voter}
            <Text style={styles.reputation}>{reputation}</Text>
          </Text>
          <Text style={styles.date}>{item.created}</Text>
        </View>
        <View style={styles.rightWrapper}>
          <Text style={[styles.value, item.is_down_vote && styles.valueGray]}>{value}</Text>
          <Text style={styles.text}>{percent}</Text>
        </View>
      </View>
    );
  };

  render() {
    const { votes } = this.props;
    console.log(votes);

    return (
      <View style={styles.container}>
        {votes.length > 0 ? (
          <FlatList
            data={votes}
            keyExtractor={item => item.voter}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => this._renderItem(item, index)}
          />
        ) : (
          <Text style={styles.text}>No user found.</Text>
        )}
      </View>
    );
  }
}

export default VotersDisplayView;
