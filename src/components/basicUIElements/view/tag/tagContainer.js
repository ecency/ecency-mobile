import React, { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';

// Services and Actions
import { getCommunityTitle } from '../../../../providers/hive/dhive';
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
const TagContainer = ({
  value,
  navigation,
  onPress,
  isPin,
  isPostCardTag,
  isFilter,
  style,
  textStyle,
  disabled,
}) => {
  const [label, setLabel] = useState(value);
  const [isCommunity, setIsCommunity] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    getCommunityTitle(value)
      .then((r) => {
        if (!isCancelled) {
          setLabel(r);
          setIsCommunity(value !== r);
          return r;
        }
      })
      .catch((e) => {
        if (!isCancelled) {
          setLabel(value);
          setIsCommunity(/^hive-\d+/.test(value));
          return value;
        }
      });

    return () => {
      isCancelled = true;
    };
  });

  // Component Functions
  const _handleOnTagPress = () => {
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

  return (
    <TagView
      isPin={isPin}
      value={value}
      label={label}
      isPostCardTag={isPostCardTag}
      onPress={_handleOnTagPress}
      isFilter={isFilter}
      style={style}
      textStyle={textStyle}
      disabled={disabled}
    />
  );
};

export default withNavigation(TagContainer);
