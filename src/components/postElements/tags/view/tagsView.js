import React, { PureComponent } from 'react';
import { View, FlatList } from 'react-native';

// Components
import { Tag } from '../../../basicUIElements';

// Styles
import styles from './tagsStyles';

// Constants
class TagsView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  // TODO: Can be stateless
  // Component Life Cycles

  // Component Functions

  render() {
    const { tags, handleOnTagPress } = this.props;

    return (
      <View style={styles.container}>
        <FlatList
          data={tags}
          horizontal
          renderItem={({ item, index }) => (
            <Tag key={index} value={item} isPin={index === 0} onPress={handleOnTagPress} />
          )}
          keyExtractor={item => item}
        />
      </View>
    );
  }
}

export default TagsView;
