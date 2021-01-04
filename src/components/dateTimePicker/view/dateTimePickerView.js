import React, { useState, useRef, forwardRef } from 'react';
import { Platform } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { FormattedDate, useIntl } from 'react-intl';

import useCombinedRefs from '../../../customHooks/useCombinedRefs';

// Component
import { Icon } from '../../icon';

// Styles
import styles from './dateTimePickerStyles';

const DateTimePickerView = React.forwardRef(({ type, iconName, disabled, onChanged }, ref) => {
  const [androidDate, setAndroidDate] = useState(moment(Date.now()));

  const _setDate = (date) => {
    if (date) {
      if (Platform.OS === 'android') {
        setAndroidDate(date);
      }

      const formattedDate = moment(date).format();

      onChanged(formattedDate);
    }
  };

  return (
    <DatePicker
      date={Platform.OS === 'android' && androidDate}
      onDateChange={_setDate}
      style={styles.picker}
      minimumDate={Platform.OS === 'ios' ? new Date() : moment(Date.now())}
      androidVariant="iosClone"
      is24hourSource="device"
    />
  );
});

export default DateTimePickerView;
