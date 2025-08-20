import React, { useState, useEffect } from 'react';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
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
  onPress,
  isPin,
  isPostCardTag,
  isFilter,
  style,
  textStyle,
  disabled,
  communityTitle,
  prefix,
  suffix,
  removeEnabled,
}) => {
  const navigation = useNavigation();

  const [label, setLabel] = useState(value);
  const [isCommunity, setIsCommunity] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async (val) => {
      try {
        const dd = await getCommunityTitle(val);
        if (!isCancelled) {
          setLabel(dd);
          setIsCommunity(value !== dd);
          return dd;
        }
      } catch (e) {
        if (!isCancelled) {
          setLabel(isFilter ? val : `#${val}`);
          setIsCommunity(/hive-[1-3]\d{4,6}$/.test(val));
          return val;
        }
      }
    };
    if (value && /hive-[1-3]\d{4,6}$/.test(value)) {
      if (communityTitle) {
        setLabel(communityTitle);
        setIsCommunity(true);
      } else {
        fetchData(value);
      }
    } else {
      setLabel(isFilter ? value : `#${value}`);
      setIsCommunity(false);
    }
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
        name: isCommunity ? ROUTES.SCREENS.COMMUNITY : ROUTES.SCREENS.TAG_RESULT,
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
      prefix={prefix}
      suffix={suffix}
      removeEnabled={removeEnabled}
    />
  );
};

export default TagContainer;
