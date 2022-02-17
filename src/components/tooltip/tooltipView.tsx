import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text } from 'react-native';
import { Popover, usePopover } from 'react-native-modal-popover';
import { useDispatch, useSelector } from 'react-redux';
import { registerTooltip } from '../../redux/actions/walkthroughActions';
import { Walkthrough } from '../../redux/reducers/walkthroughReducer';

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
  const tooltipState = useSelector((state) => state.walkthrough.walkthroughMap);
  const tooltipRegistered = tooltipState.get(walkthroughIndex);


  useImperativeHandle(ref, () => ({
    openTooltip() {
      if (!tooltipRegistered) {
        openPopover();
      }
      if (tooltipRegistered && !tooltipRegistered.isShown) {
        openPopover();
      }
    },
    closeTooltip() {
      if (!tooltipRegistered || (tooltipRegistered && !tooltipRegistered.isShown)) {
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
