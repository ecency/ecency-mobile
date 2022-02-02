import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';
import { Popover, usePopover } from 'react-native-modal-popover';
import { useDispatch, useSelector } from 'react-redux';
import { registerTooltip } from '../../redux/actions/tooltipsActions';

import styles from './tooltipStyles';
interface TooltipProps {
  children?: any;
  text?: string;
  walkthroughId?: string;
}
const Tooltip = ({ children, text, walkthroughId }: TooltipProps, ref) => {
  const {
    openPopover,
    closePopover,
    popoverVisible,
    touchableRef,
    popoverAnchorRect,
  } = usePopover();

  const dispatch = useDispatch();
  const isTooltipDone = useSelector((state) => state.tooltips.isDone);

  useImperativeHandle(ref, () => ({
    openTooltip() {
      !isTooltipDone && openPopover();
    },
    closeTooltip() {
      !isTooltipDone && dispatch(registerTooltip(walkthroughId));
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
        onClose={ref?.current?.closeTooltip}
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
