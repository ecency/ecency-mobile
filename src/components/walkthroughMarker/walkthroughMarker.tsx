import React from 'react';
import { View, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useDispatch, useSelector } from 'react-redux';
import { registerWalkthroughItem } from '../../redux/actions/walkthroughActions';
import { WalkthroughItem } from '../../redux/reducers/walkthroughReducer';

interface WalkthroughMarkerProps {
  children: (onIntercept: (props: any) => void) => React.ReactNode; // Render prop pattern with a function as a child
  hidden?: boolean;
  markerStyle?: ViewStyle; // Optional style for the marker (red dot)
  walkthroughIndex: number; // A unique index for each walkthrough step
  onInterceptComplete: (props: any) => void; // Optional callback to be triggered after marking as complete
}

export const WalkthroughMarker = ({
  children,
  hidden,
  markerStyle,
  walkthroughIndex,
  onInterceptComplete,
}: WalkthroughMarkerProps) => {
  const dispatch = useDispatch();
  const tooltipRegistered = useSelector((state) =>
    state.walkthrough.walkthroughMap.get(walkthroughIndex),
  );

  const onIntercept = (props: any) => {
    if (!hidden && !tooltipRegistered) {
      const walkthrough: WalkthroughItem = {
        walkthroughIndex,
        isShown: true,
      };
      dispatch(registerWalkthroughItem(walkthrough));
    }
    onInterceptComplete(props);
  };

  return (
    <View style={styles.container}>
      {children(onIntercept)}
      {!hidden && !tooltipRegistered && <View style={{ ...styles.redDot, ...markerStyle }} />}
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    position: 'relative', // allows absolute positioning of the red dot
  },
  redDot: {
    position: 'absolute',
    right: 8,
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5, // makes the view circular
    backgroundColor: '$primaryRed',
  },
});
