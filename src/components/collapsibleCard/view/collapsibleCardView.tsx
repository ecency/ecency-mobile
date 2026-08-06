import React, { useEffect, useState } from 'react';
import { View, TouchableHighlight } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Components
import { ContainerHeader } from '../../containerHeader';
// Styles
import styles from './collapsibleCardStyles';

const CollapsibleCardView = (props: any) => {
  const {
    title,
    children,
    defaultTitle,
    fontSize,
    titleColor,
    isBoldTitle,
    locked,
    titleComponent,
    noBorder,
    fitContent,
    isTitleCenter,
    style,
    noContainer,
    handleOnExpanded,
    moreHeight,
    expanded,
    isExpanded,
  } = props;

  const [contentHeight, setContentHeight] = useState(0);
  // The height must stay unset until onLayout measures the natural content
  // size: an initial 0 clamps the view, so measurement would always read 0
  // and the card could never expand.
  const animation = useSharedValue<{ height: number | undefined }>({ height: undefined });
  const animationStyle = useAnimatedStyle(() => {
    return animation.value.height === undefined
      ? {}
      : {
          height: withTiming(animation.value.height, {
            duration: 500,
          }),
        };
  });

  const [collapsed, setCollapsed] = useState(expanded || isExpanded || false);

  useEffect(() => {
    if (isExpanded !== undefined && contentHeight) {
      animation.value = { height: !isExpanded ? 0 : contentHeight + (moreHeight || 0) };
      setCollapsed(isExpanded);
    }
  }, [isExpanded, contentHeight, moreHeight]);
  const _toggleOnPress = () => {
    animation.value = { height: collapsed ? 0 : contentHeight + (moreHeight || 0) };
    setCollapsed(!collapsed);
    if (handleOnExpanded) {
      handleOnExpanded();
    }
  };

  const _initContentHeight = (event: any) => {
    if (contentHeight > 0) {
      return;
    }
    setContentHeight(event.nativeEvent.layout.height);
    animation.value = {
      height: !expanded ? 0 : event.nativeEvent.layout.height + (moreHeight || 0),
    };
    setCollapsed(expanded || false);
  };

  return (
    <View style={[styles.container, !noBorder && styles.containerWithBorder, style]}>
      <TouchableHighlight underlayColor="transparent" onPress={() => !locked && _toggleOnPress()}>
        {titleComponent || (
          <ContainerHeader
            isCenter={isTitleCenter}
            color={titleColor || '#788187'}
            fontSize={fontSize || 12}
            title={title}
            defaultTitle={defaultTitle}
            isBoldTitle={isBoldTitle}
            iconName={collapsed ? 'arrow-drop-down' : 'arrow-drop-up'}
          />
        )}
      </TouchableHighlight>
      <Animated.View
        style={[styles.content, animationStyle]}
        onLayout={(e) => _initContentHeight(e)}
      >
        <View style={[!fitContent && !noContainer && styles.contentBody]}>{children}</View>
      </Animated.View>
    </View>
  );
};
export default CollapsibleCardView;
