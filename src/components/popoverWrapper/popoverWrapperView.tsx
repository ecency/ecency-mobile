import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Popover from 'react-native-popover-view';
import styles from './popoverWrapperStyles';

const PopoverWrapper = ({ children, text }: any) => {
  const _anchorComponent = (sourceRef: any, showPopover: any) => (
    <TouchableOpacity ref={sourceRef} onPress={showPopover}>
      {children}
    </TouchableOpacity>
  );

  const _popoverContent = (
    <View style={styles.popoverWrapper}>
      <Text style={styles.popoverText}>{text}</Text>
    </View>
  );

  return (
    <Popover
      from={_anchorComponent} // Anchor reference
      backgroundStyle={styles.overlay} // Overlay style
      popoverStyle={styles.popoverDetails} // Popover content style
      {...({ arrowStyle: styles.arrow } as any)} // Arrow style
    >
      {_popoverContent}
    </Popover>
  );
};

export { PopoverWrapper };
