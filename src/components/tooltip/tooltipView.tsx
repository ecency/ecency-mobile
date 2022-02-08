import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';
import { Popover, usePopover } from 'react-native-modal-popover';
import { useDispatch, useSelector } from 'react-redux';
import { registerTooltip } from '../../redux/actions/tooltipsActions';
import { Walkthrough } from '../../redux/reducers/tooltipsReducer';

import styles from './tooltipStyles';
interface TooltipProps {
  children?: any;
  text?: string;
  walkthroughIndex?: number;
}
const Tooltip = ({ children, text, walkthroughIndex }: TooltipProps, ref) => {
  const {
    openPopover,
    closePopover,
    popoverVisible,
    touchableRef,
    popoverAnchorRect,
  } = usePopover();

  const dispatch = useDispatch();
  const tooltipState = useSelector((state) => state.tooltips.walkthroughMap);
  const isTooltipShown = tooltipState[walkthroughIndex].isShown;

  useImperativeHandle(ref, () => ({
    openTooltip() {
      !isTooltipShown && openPopover();
    },
    closeTooltip() {
      if (!isTooltipShown) {
        const walkthrough: Walkthrough = {
          walkthroughIndex: walkthroughIndex,
          isShown: true,
        };
        dispatch(registerTooltip(walkthrough));
      }
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
