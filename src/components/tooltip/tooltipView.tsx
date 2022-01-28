import React, { forwardRef, Fragment, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, Button } from 'react-native';
import { Popover, usePopover } from 'react-native-modal-popover';

import styles from './tooltipStyles';
interface TooltipProps {
  children?: any;
  text?: string;
}
const Tooltip = ({ children, text }: TooltipProps, ref) => {
  const {
    openPopover,
    closePopover,
    popoverVisible,
    touchableRef,
    popoverAnchorRect,
  } = usePopover();

  useImperativeHandle(ref, () => ({
    openTooltip() {
      openPopover();
    },
    closeTooltip() {
      closePopover();
    },
  }));

  return (
    <>
      <View ref={touchableRef}>{children}</View>
      <Popover
        backgroundStyle={styles.overlay}
        contentStyle={styles.popoverDetails}
        arrowStyle={styles.arrow}
        visible={popoverVisible}
        onClose={closePopover}
        fromRect={popoverAnchorRect}
        placement="top"
        supportedOrientations={['portrait', 'landscape']}
      >
        <Text>{text}</Text>
      </Popover>
    </>
  );
};

export default forwardRef(Tooltip as any);
