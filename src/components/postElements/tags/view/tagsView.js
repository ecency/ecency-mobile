import React, { Component } from 'react';
import { View } from 'react-native';

// Components
import { Tag } from '../../../basicUIElements';

// Styles
import styles from './tagsStyles';

// Constants
class TagsView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { tags, handleOnTagPress } = this.props;

    return (
      <View style={styles.container}>
        {tags.map((chip, i) => (
          <Tag key={i} value={chip} isPin={i === 0} onPress={handleOnTagPress} />
        ))}
      </View>
    );
  }
}

export default TagsView;
