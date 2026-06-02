import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { Icon } from '../../icon';
import styles from './upvoteStyles';
import {
  appendDigit,
  backspaceBuffer,
  commitPercent,
  parseBufferPercent,
} from './percentKeypadUtils';

// IconView is an untyped class component; alias to keep the runtime component
// while satisfying TS for the iconType/name/size props.
const KeyIcon = Icon as unknown as React.ComponentType<any>;

/*
 * Keyboard-free numeric keypad shown inside the vote popover when the user taps
 * the NN% label, giving exact value entry like the vision-next web input —
 * without ever raising the OS keyboard (which would be occluded by this
 * Modal-hosted popover). Vote weight is whole-percent on chain, so an integer
 * keypad has full precision parity with typing.
 *
 * Every keypress commits live through onChange(ratio 0..1) so the $ estimate and
 * (hidden) fill stay in sync; the check key clamps to the floor and calls
 * onDone() to return to the slider row. The actual vote still only fires from
 * the up/down icons after the keypad is dismissed.
 */

interface PercentKeypadProps {
  // Current value in the 0..1 range.
  value: number;
  // Lower bound (0..1): 0 when a vote exists (allows removal), else 0.01.
  minValue: number;
  // Pre-formatted "$x.xx" estimate from the container, kept in sync via onChange.
  amount: string;
  color: string;
  onChange: (value: number) => void;
  onDone: () => void;
}

const PercentKeypad = ({
  value,
  minValue,
  amount,
  color,
  onChange,
  onDone,
}: PercentKeypadProps) => {
  const minPercent = Math.round(minValue * 100);
  const [buffer, setBuffer] = useState(String(Math.round(value * 100)));

  // Each edit commits the live (upper-clamped) value so the $ estimate and fill
  // stay in sync; the lower bound is only enforced when the user taps Done.
  const _emit = (buf: string) => onChange(parseBufferPercent(buf) / 100);

  const _pressDigit = (digit: number) => {
    const next = appendDigit(buffer, digit);
    setBuffer(next);
    _emit(next);
  };

  const _backspace = () => {
    const next = backspaceBuffer(buffer);
    setBuffer(next);
    _emit(next);
  };

  const _done = () => {
    onChange(commitPercent(buffer, minPercent) / 100);
    onDone();
  };

  const _renderDigit = (digit: number) => (
    <TouchableOpacity
      key={digit}
      style={styles.keypadKey}
      onPress={() => _pressDigit(digit)}
      activeOpacity={0.6}
    >
      <Text style={styles.keypadKeyText}>{digit}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.keypadWrapper}>
      <View style={styles.keypadHeader}>
        <Text style={[styles.keypadValue, { color }]}>{`${buffer === '' ? 0 : buffer}%`}</Text>
        <Text style={styles.keypadAmount}>{`$${amount}`}</Text>
      </View>

      <View style={styles.keypadRow}>{[1, 2, 3].map(_renderDigit)}</View>
      <View style={styles.keypadRow}>{[4, 5, 6].map(_renderDigit)}</View>
      <View style={styles.keypadRow}>{[7, 8, 9].map(_renderDigit)}</View>
      <View style={styles.keypadRow}>
        <TouchableOpacity style={styles.keypadKey} onPress={_backspace} activeOpacity={0.6}>
          <KeyIcon iconType="MaterialIcons" name="backspace" style={styles.keypadIcon} size={20} />
        </TouchableOpacity>
        {_renderDigit(0)}
        <TouchableOpacity
          style={[styles.keypadKey, styles.keypadDoneKey, { backgroundColor: color }]}
          onPress={_done}
          activeOpacity={0.8}
        >
          <KeyIcon iconType="AntDesign" name="check" style={styles.keypadDoneIcon} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PercentKeypad;
