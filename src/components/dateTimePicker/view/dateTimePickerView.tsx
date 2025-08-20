import React, { useState } from 'react';
import { View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

// Utils
import getLocale from '../../../utils/getLocale';

// Styles
import styles from './dateTimePickerStyles';

const DateTimePickerView = ({ type, onChanged, selectedDate }: any, _ref: any) => {
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

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
        textColor={styles.datePickerText.color}
        date={date}
        onDateChange={_setDate}
        minimumDate={new Date()}
        androidVariant="iosClone"
        is24hourSource="device"
        locale={getLocale()}
        mode={type}
      />
    </View>
  );
};

export default React.forwardRef(DateTimePickerView);
