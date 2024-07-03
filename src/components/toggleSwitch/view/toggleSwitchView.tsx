import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, NativeModules } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

// Styles
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './toggleSwitchStyles';

interface Props {
  onColor: string;
  offColor: string;
  isOn: boolean;
  latchBack: boolean;
  onToggle: (value: boolean) => void;
}

const ToggleSwitchView = ({ onColor, offColor, latchBack, onToggle, ...props }: Props) => {
  const [isOn, setIsOn] = useState(false);

  const offsetX = useSharedValue(0);

  useEffect(() => {
    const _width = 68;
    const _translateX = 36;
    const _toValue = isOn ? _width - (NativeModules.I18nManager.isRTL ? 100 : _translateX) : 0; // in rtl layout, set the translate value to 100
    offsetX.value = withTiming(_toValue);
  }, [isOn]);

  useEffect(() => {
    if (props.isOn !== isOn) {
      setIsOn(props.isOn);
    }
  }, [props.isOn]);

  const _onToggle = () => {
    setIsOn(!isOn);

    // For debounce
    setTimeout(() => {
      if (onToggle) {
        onToggle(!isOn);
      }
      // this.setState({isOn})
    }, 300);

    if (latchBack) {
      setTimeout(() => {
        setIsOn(isOn);
      }, 500);
    }
  };

  const _switchStyle = {
    ...styles.switch,
    backgroundColor: isOn
      ? onColor || EStyleSheet.value('$primaryBlue')
      : offColor || EStyleSheet.value('$primaryGray'),
  };

  const _circleStyle = {
    ...styles.circle,
    transform: [{ translateX: offsetX }],
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={_switchStyle} activeOpacity={0.8} onPress={_onToggle}>
        <Animated.View style={_circleStyle} />
      </TouchableOpacity>
    </View>
  );
};

export default ToggleSwitchView;
