import React, { useState, useRef, forwardRef } from 'react';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import { useIntl } from 'react-intl';

import useCombinedRefs from '../../../customHooks/useCombinedRefs';

// Component
import { Icon } from '../../icon';

// Styles
import styles from './dateTimePickerStyles';

const DateTimePickerView = React.forwardRef(({ type, iconName, disabled, onSubmit }, ref) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  let _type;
  let _format;
  let _minDate;

  const intl = useIntl();
  const innerRef = useRef(null);
  const datePickerRef = useCombinedRefs(ref, innerRef);

  if (type === 'date-time') {
    _type = date ? 'time' : 'date';
    _format = date ? 'HH:mm' : 'YYYY-MM-DD';
    _minDate = date ? null : moment().format('YYYY-MM-DD');
  } else {
    _type = type;
    _format = type === 'date' ? 'YYYY-MM-DD' : 'HH:mm';
    _minDate = type === 'date' ? moment().format('YYYY-MM-DD') : null;
  }

  const _initState = () => {
    setDate('');
    setTime('');
  };

  const _setValue = (setFunc, value) => {
    const _value = value === 'Invalid date' ? moment().format('HH:mm:ss') : value;
    setFunc(_value);
    let timePickerTimeout;

    if (!time && !date) {
      timePickerTimeout = setTimeout(() => {
        datePickerRef.onPressDate();
      }, 500);
    } else {
      clearTimeout(timePickerTimeout);
    }

    if (date && _value) {
      const formatedDateTime = moment(`${date} ${_value}`, 'YYYY-MM-DD HH:mm').toISOString();
      onSubmit(formatedDateTime);
      _initState();
    }
  };

  return (
    <DatePicker
      style={styles.picker}
      mode={_type}
      format={_format}
      minDate={_minDate}
      confirmBtnText={intl.formatMessage({
        id: 'alert.confirm',
      })}
      cancelBtnText={intl.formatMessage({
        id: 'alert.cancel',
      })}
      onDateChange={(_datePickerValue) => _setValue(!date ? setDate : setTime, _datePickerValue)}
      hideText
      is24Hour
      ref={datePickerRef}
      disabled={disabled}
      customStyles={{
        ...styles,
      }}
      showIcon={false}
      // iconComponent={
      //   // eslint-disable-next-line react/jsx-wrap-multilines
      //   <Icon
      //     style={{ ...styles.iconButton, ...styles.scheduleIcon }}
      //     size={20}
      //     iconType="MaterialIcons"
      //     name={iconName}
      //   />
      // }
    />
  );
});

DateTimePickerView.defaultProps = {
  iconName: 'timer',
  type: 'date',
};

export default DateTimePickerView;
