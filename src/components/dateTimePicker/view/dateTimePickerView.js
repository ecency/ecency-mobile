import React, { useState } from 'react';
import { View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

// Utils
import getLocale from '../../../utils/getLocale';

// Styles
import styles from './dateTimePickerStyles';

const DateTimePickerView = React.forwardRef(({ type, onChanged, selectedDate }) => {
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

  const _setDate = (_date) => {
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
});

export default DateTimePickerView;
