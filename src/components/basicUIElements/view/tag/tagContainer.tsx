import React, { useState, useEffect } from 'react';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import { getCommunityQueryOptions } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
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
}: any) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [label, setLabel] = useState(value);
  const [isCommunity, setIsCommunity] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const fetchData = async (val: any) => {
      try {
        const community = await queryClient.fetchQuery(getCommunityQueryOptions(val, ''));
        const dd = community?.title || val;
        if (!isCancelled) {
          setLabel(dd);
          setIsCommunity(value !== dd);
          return dd;
        }
      } catch (e) {
        if (!isCancelled) {
          setLabel(val);
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
      // Bare, like the web: a plain tag reads as itself and a community as its
      // title, which is capitalised, so the two never look alike in one row.
      setLabel(value);
      setIsCommunity(false);
    }
    return () => {
      isCancelled = true;
    };
    // Only re-run when the inputs change. Without a dependency array this effect ran on
    // every render and its unconditional setLabel/setIsCommunity calls fed back into it,
    // looping until React threw "Maximum update depth exceeded".
  }, [value, communityTitle, isFilter, queryClient]);

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
