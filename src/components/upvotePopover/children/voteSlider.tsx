import React, { useRef, useState } from 'react';
import { View, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';

import styles from './upvoteStyles';

/*
 * Custom voting slider inspired by the vision-next web "input-vote" control.
 *
 * Replaces the thin native @react-native-community/slider (a ~16px thumb on a
 * 2px track, which many users struggled to grab precisely) with a fat
 * drag-anywhere fill bar: tapping or dragging anywhere along the track sets the
 * value from the finger's position, giving the whole bar height as a touch
 * target. A colored fill (blue for upvote, red for downvote) grows from the
 * left and a thumb sits at the fill edge as an affordance.
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
 *
 * Finger position is mapped from the gesture's ABSOLUTE window X
 * (gestureState.moveX) against the track's measured window-left, NOT from the
 * per-event `evt.nativeEvent.locationX`. On Android, locationX on move events
 * intermittently arrives relative to a parent/window origin instead of the
 * track itself; dividing that by the track width overshot the value by exactly
 * trackLeft/trackWidth (~0.56) and clamped it to 100%, so the thumb visibly
 * "slipped" forward and stuck there while the finger stayed mid-track. moveX
 * and measureInWindow() share the same window coordinate space, so the ratio is
 * unambiguous regardless of which native view the OS hit-tests under the finger.
 */

interface VoteSliderProps {
  // Current value in the 0..1 range (matches the legacy native slider contract).
  value: number;
  // Lower bound — 0 when a vote already exists (so it can be reduced/removed),
  // otherwise 0.01 (1%) to keep the on-chain weight non-zero.
  minValue?: number;
  color: string;
  onValueChange: (value: number) => void;
  // Spoken label for the adjustable control (e.g. "Upvote weight").
  accessibilityLabel?: string;
}

const THUMB_SIZE = 18;
// Step applied per VoiceOver/TalkBack increment/decrement swipe.
const ACCESSIBILITY_STEP = 0.05;

const VoteSlider = ({
  value,
  minValue = 0,
  color,
  onValueChange,
  accessibilityLabel = 'Vote weight',
}: VoteSliderProps) => {
  // Measured track width drives the thumb's pixel position so it stays fully
  // visible at both ends; widthRef mirrors it for the (memoised) PanResponder.
  const [trackWidth, setTrackWidth] = useState(0);
  // 0 = not yet measured (onLayout hasn't fired). Mirrors trackWidth for the
  // memoised PanResponder; see _ratioFromPageX for the pre-layout guard.
  const widthRef = useRef(0);
  // Track's left edge in WINDOW coordinates — the origin the absolute-X gesture
  // mapping subtracts from gestureState.moveX. Refreshed on layout and at each
  // gesture start so it stays correct even as the row reflows (the $estimate and
  // NN% labels are variable-width siblings of this flex track and change width
  // as the user votes).
  const trackLeftRef = useRef(0);
  const trackRef = useRef<View>(null);
  const minRef = useRef(minValue);
  minRef.current = minValue;
  const onChangeRef = useRef(onValueChange);
  onChangeRef.current = onValueChange;

  // Cache the track's window geometry from a fresh native measurement.
  const _measureTrack = () => {
    trackRef.current?.measureInWindow((x: number, _y: number, w: number) => {
      if (typeof x === 'number') {
        trackLeftRef.current = x;
      }
      if (w) {
        widthRef.current = w;
      }
    });
  };

  const _ratioFromPageX = (pageX: number) => {
    // Ignore touches before the track is measured — dividing by a sentinel
    // width would otherwise snap the first touch straight to 100%.
    if (!widthRef.current) {
      return minRef.current;
    }
    const ratio = (pageX - trackLeftRef.current) / widthRef.current;
    return Math.min(1, Math.max(minRef.current, ratio));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Keep the gesture even if an ancestor scroll view wants it.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState,
      ) => {
        // Re-measure at touch-down for the freshest origin, then map the initial
        // touch — x0 is the grant's absolute window X (== moveX at grant).
        _measureTrack();
        onChangeRef.current(_ratioFromPageX(gestureState.x0));
      },
      onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        onChangeRef.current(_ratioFromPageX(gestureState.moveX));
      },
    }),
  ).current;

  // VoiceOver/TalkBack adjust the value via increment/decrement swipes rather
  // than the (gesture-only) PanResponder, so map those to a stepped change.
  const _onAccessibilityAction = (event: { nativeEvent: { actionName: string } }) => {
    const delta =
      event.nativeEvent.actionName === 'increment' ? ACCESSIBILITY_STEP : -ACCESSIBILITY_STEP;
    const next = Math.round((value + delta) * 100) / 100;
    onValueChange(Math.min(1, Math.max(minValue, next)));
  };

  const clamped = Math.min(1, Math.max(0, value));
  const fillWidth = clamped * trackWidth;
  // Center the thumb on the fill edge, clamped so it never overflows the track.
  const thumbLeft = Math.min(trackWidth - THUMB_SIZE, Math.max(0, fillWidth - THUMB_SIZE / 2));

  return (
    <View style={styles.voteSliderRow}>
      <View
        ref={trackRef}
        style={styles.voteSliderTrack}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width;
          setTrackWidth(e.nativeEvent.layout.width);
          // layout.x is parent-relative; capture the window-left for the gesture.
          _measureTrack();
        }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{
          min: Math.round(minValue * 100),
          max: 100,
          now: Math.round(clamped * 100),
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={_onAccessibilityAction}
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
