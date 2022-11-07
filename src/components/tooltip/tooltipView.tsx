import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, Text, findNodeHandle, NativeModules } from 'react-native';
import { Popover } from 'react-native-modal-popover';
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
  const dispatch = useDispatch();
  const tooltipState = useSelector((state) => state.walkthrough.walkthroughMap);
  const tooltipRegistered = tooltipState.get(walkthroughIndex);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const touchableRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openTooltip() {
      if (!tooltipRegistered || (tooltipRegistered && !tooltipRegistered.isShown)) {
        setShowPopover(true);
      }
    },
    closeTooltip() {
      if (!tooltipRegistered || (tooltipRegistered && !tooltipRegistered.isShown)) {
        const walkthrough: Walkthrough = {
          walkthroughIndex,
          isShown: true,
        };
        dispatch(registerTooltip(walkthrough));
      }
      setShowPopover(false);
    },
  }));

  const _findAnchor = (e) => {
    if (touchableRef.current) {
      NativeModules.UIManager.measure(touchableRef.current, (x0, y0, width, height, x, y) => {
        setPopoverAnchor({ x, y, width, height });
      });
    }
  };
  return (
    <>
      <View
        ref={(ref) => {
          touchableRef.current = findNodeHandle(ref);
        }}
        onLayout={_findAnchor}
      >
        {children}
      </View>
      <Popover
        backgroundStyle={styles.overlay}
        contentStyle={styles.popoverDetails}
        arrowStyle={styles.arrow}
        visible={showPopover}
        onClose={() => ref?.current?.closeTooltip()}
        fromRect={popoverAnchor}
        supportedOrientations={['portrait', 'landscape']}
      >
        <Text>{text}</Text>
      </Popover>
    </>
  );
};

export default forwardRef(Tooltip);
