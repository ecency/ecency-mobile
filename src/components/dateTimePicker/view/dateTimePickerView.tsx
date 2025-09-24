import React, { useState } from 'react';
import { View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

// Utils
import getLocale from '../../../utils/getLocale';

// Styles
import styles from './dateTimePickerStyles';
import { useAppSelector } from '../../../hooks';

const DateTimePickerView = ({ type, onChanged, selectedDate }: any, _ref: any) => {
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

  const _setDate = (_date: Date) => {
    if (_date) {
      const formattedDate = moment(_date).format();

      setDate(_date);
      onChanged(formattedDate);
    }
  };

  return (
    <View style={styles.container}>
      <DatePicker
        date={date}
        theme={isDarkTheme ? 'dark' : 'light'}
        onDateChange={_setDate}
        minimumDate={new Date()}
        is24hourSource="device"
        locale={getLocale()}
        mode={type}
      />
    </View>
  );
};

export default React.forwardRef(DateTimePickerView);
