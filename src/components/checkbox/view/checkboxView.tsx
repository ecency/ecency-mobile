import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';

import styles from './checkboxStyles';

interface CheckBoxProps {
  value: string;
  isChecked: boolean;
  locked?: boolean;
  isRound?: boolean;
  style?: ViewStyle;
  clicked: (val: string, isChecked: boolean) => void;
}

const CheckBoxView = ({ clicked, value, isChecked, style, locked, isRound }: CheckBoxProps) => {
  const [isCheck, setIsCheck] = useState(false);

  useEffect(() => {
    setIsCheck(isChecked);
  }, [isChecked]);

  const _checkClicked = () => {
    setIsCheck(!isCheck);

    if (clicked) {
      clicked(value, !isCheck);
    }
  };

  const containerStyle = [styles.bigSquare, style, isRound && { borderRadius: 10 }];
  const innerStyle = [
    styles.smallSquare,
    isCheck && styles.checked,
    isRound && { borderRadius: 5 },
  ];

  return (
    <TouchableOpacity disabled={locked} onPress={_checkClicked}>
      <View style={containerStyle}>
        <View style={innerStyle} />
      </View>
    </TouchableOpacity>
  );
};

export default CheckBoxView;
