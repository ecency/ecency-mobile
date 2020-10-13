import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';

// Services and Actions
import { getCommunityTitle } from '../../../../providers/steem/dsteem';
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
  constructor(props) {
    super(props);

    this.state = {
      label: props.value,
      isCommunity: false,
    };
  }
  // Component Life Cycle Functions
  componentDidMount() {
    const { value } = this.props;

    getCommunityTitle(value)
      .then((r) => {
        this.setState({
          label: r,
          isCommunity: value !== r,
        });
        return r;
      })
      .catch(() => {});
  }
  // Component Functions
  _handleOnTagPress = () => {
    const { navigation, onPress, value } = this.props;
    const { isCommunity } = this.state;

    if (onPress) {
      onPress();
    } else {
      navigation.navigate({
        routeName: isCommunity ? ROUTES.SCREENS.COMMUNITY : ROUTES.SCREENS.TAG_RESULT,
        params: {
          tag: value,
        },
      });
    }
  };

  render() {
    const { isPin, value, isPostCardTag, isFilter, style, textStyle, disabled } = this.props;
    const { label } = this.state;

    return (
      <TagView
        isPin={isPin}
        value={value}
        label={label}
        isPostCardTag={isPostCardTag}
        onPress={this._handleOnTagPress}
        isFilter={isFilter}
        style={style}
        textStyle={textStyle}
        disabled={disabled}
      />
    );
  }
}

export default withNavigation(TagContainer);
