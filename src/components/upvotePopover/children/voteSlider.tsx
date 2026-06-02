import React, { useRef, useState } from 'react';
import { View, PanResponder, GestureResponderEvent } from 'react-native';

import styles from './upvoteStyles';

/*
 * Custom voting slider inspired by the vision-next web "input-vote" control.
 *
 * Replaces the thin native @react-native-community/slider (a ~16px thumb on a
 * 2px track, which many users struggled to grab precisely) with a fat
 * drag-anywhere fill bar: tapping or dragging anywhere along the track sets the
 * value from the finger's absolute X position, giving the whole bar height as a
 * touch target. A colored fill (blue for upvote, red for downvote) grows from
 * the left and a thumb sits at the fill edge as an affordance.
 *
 * This handles the easy/coarse case. For an exact value, the popover's NN%
 * label is tappable and opens a keyboard-free numeric keypad (see
 * percentKeypad.tsx) — the chain rounds vote weight to whole percent, so the
 * keypad gives full precision parity with the web without ever raising the OS
 * keyboard (which would otherwise be occluded by this Modal-hosted popover).
 *
 * Built on PanResponder rather than react-native-gesture-handler because the
 * popover renders inside a React Native Modal, where gesture-handler needs its
 * own GestureHandlerRootView; PanResponder works there with no extra setup.
 */

interface VoteSliderProps {
  // Current value in the 0..1 range (matches the legacy native slider contract).
  value: number;
  // Lower bound — 0 when a vote already exists (so it can be reduced/removed),
  // otherwise 0.01 (1%) to keep the on-chain weight non-zero.
  minValue?: number;
  color: string;
  onValueChange: (value: number) => void;
}

const THUMB_SIZE = 18;

const VoteSlider = ({ value, minValue = 0, color, onValueChange }: VoteSliderProps) => {
  // Measured track width drives the thumb's pixel position so it stays fully
  // visible at both ends; widthRef mirrors it for the (memoised) PanResponder.
  const [trackWidth, setTrackWidth] = useState(0);
  // 0 = not yet measured (onLayout hasn't fired). Mirrors trackWidth for the
  // memoised PanResponder; see _ratioFromX for the pre-layout guard.
  const widthRef = useRef(0);
  const minRef = useRef(minValue);
  minRef.current = minValue;
  const onChangeRef = useRef(onValueChange);
  onChangeRef.current = onValueChange;

  const _ratioFromX = (locationX: number) => {
    // Ignore touches before the track is measured — dividing by a sentinel
    // width would otherwise snap the first touch straight to 100%.
    if (!widthRef.current) {
      return minRef.current;
    }
    const ratio = locationX / widthRef.current;
    return Math.min(1, Math.max(minRef.current, ratio));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Keep the gesture even if an ancestor scroll view wants it.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        onChangeRef.current(_ratioFromX(evt.nativeEvent.locationX));
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        onChangeRef.current(_ratioFromX(evt.nativeEvent.locationX));
      },
    }),
  ).current;

  const clamped = Math.min(1, Math.max(0, value));
  const fillWidth = clamped * trackWidth;
  // Center the thumb on the fill edge, clamped so it never overflows the track.
  const thumbLeft = Math.min(trackWidth - THUMB_SIZE, Math.max(0, fillWidth - THUMB_SIZE / 2));

  return (
    <View style={styles.voteSliderRow}>
      <View
        style={styles.voteSliderTrack}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width;
          setTrackWidth(e.nativeEvent.layout.width);
        }}
        {...panResponder.panHandlers}
      >
        <View
          pointerEvents="none"
          style={[styles.voteSliderFill, { width: fillWidth, backgroundColor: color }]}
        />
        {trackWidth > 0 && (
          <View
            pointerEvents="none"
            style={[styles.voteSliderThumb, { left: thumbLeft, borderColor: color }]}
          />
        )}
      </View>
    </View>
  );
};

export default VoteSlider;
