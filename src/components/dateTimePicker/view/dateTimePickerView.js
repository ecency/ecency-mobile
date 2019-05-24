import React, { useState } from 'react';
import { View } from 'react-native';

// Styles
import styles from './dateTimePickerStyles';

const DateTimePickerView = (props) => {
  const {
    type,
    isChecked,
    onSubmit,
  } = props;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  return (
    <View />
  );
};

export default DateTimePickerView;
