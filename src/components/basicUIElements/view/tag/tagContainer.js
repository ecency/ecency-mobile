import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';

// Services and Actions

// Middleware

// Constants
import ROUTES from '../../../../constants/routeNames';

// Utilities

// Component
import TagView from './tagView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class TagContainer extends PureComponent {
  // Component Life Cycle Functions

  // Component Functions
  _handleOnTagPress = () => {
    const { navigation, onPress, value } = this.props;

    if (onPress) {
      onPress();
    } else {
      navigation.navigate({
        routeName: ROUTES.SCREENS.SEARCH_RESULT,
        params: {
          tag: value,
        },
      });
    }
  };

  render() {
    const { isPin, value, isPostCardTag } = this.props;

    return (
      <TagView
        isPin={isPin}
        value={value}
        isPostCardTag={isPostCardTag}
        onPress={this._handleOnTagPress}
      />
    );
  }
}

export default withNavigation(TagContainer);
