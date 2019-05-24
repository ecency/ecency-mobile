import React, { PureComponent } from 'react';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import { injectIntl } from 'react-intl';

// Component
import { Icon } from '../../icon';

// Styles
import styles from './dateTimePickerStyles';

class DateTimePickerView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      date: '',
      time: '',
    };
  }

  _initState = () => {
    this.setState({
      date: '',
      time: '',
    });
  }

  _setValue = (stateName, value) => {
    const { onSubmit } = this.props;
    const { date, time } = this.state;
    this.setState({ [stateName]: value });

    if (!time && !date) {
      this.timePickerTimeout = setTimeout(() => {
        this.datePicker.onPressDate();
      }, 500);
    } else {
      clearTimeout(this.timePickerTimeout);
    }

    if (date && value) {
      const formatedDateTime = new Date(`${date} ${value}`).toISOString();
      onSubmit(formatedDateTime);
      this._initState();
    }
  }


  render() {
    const {
      type,
      iconName,
      disabled,
      intl,
    } = this.props;
    const { date } = this.state;
    let _type;
    let _format;
    let _minDate;

    if (type === 'date-time') {
      _type = date ? 'time' : 'date';
      _format = date ? 'HH:MM' : 'YYYY-MM-DD';
      _minDate = date ? null : moment();
    } else {
      _type = type;
      _format = type === 'date' ? 'YYYY-MM-DD' : 'HH:MM';
      _minDate = type === 'date' ? moment() : null;
    }

    return (
      <DatePicker
        style={{ width: 50 }}
        date={date}
        mode={_type}
        format={_format}
        minDate={_minDate}
        confirmBtnText={intl.formatMessage({
          id: 'alert.confirm',
        })}
        cancelBtnText={intl.formatMessage({
          id: 'alert.cancel',
        })}
        onDateChange={_datePickerValue => this._setValue(!date ? 'date' : 'time', _datePickerValue)}
        hideText
        is24Hour
        ref={(picker) => { this.datePicker = picker; }}
        disabled={disabled}
        customStyles={{
          ...styles,
        }}
        iconComponent={(
          <Icon
            style={{ ...styles.iconButton, ...styles.scheduleIcon }}
            size={20}
            iconType="MaterialIcons"
            name={iconName}
          />
        )}
      />
    );
  }
}

DateTimePickerView.defaultProps = {
  iconName: 'timer',
  type: 'date',
};

export default injectIntl(DateTimePickerView);
