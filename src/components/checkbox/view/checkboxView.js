import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';

import styles from './checkboxStyles';

const CheckBoxView = ({ clicked, value, isChecked, style, locked }) => {
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

  if (locked) {
    return (
      <View style={styles.bigSquare}>
        <View style={[styles.smallSquare, isChecked && styles.checked]} />
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={_checkClicked} style={style}>
      <View style={styles.bigSquare}>
        <View style={[styles.smallSquare, isCheck && styles.checked]} />
      </View>
    </TouchableOpacity>
  );
};

export default CheckBoxView;
