import React, { PureComponent } from 'react';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';

// Component
import { Icon } from '../../icon';

// Styles
import styles from './dateTimePickerStyles';

export default class DateTimePickerView extends PureComponent {
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

    if (!time) this.datePicker.onPressDate();

    if (date) {
      onSubmit(value);
      this._initState();
    }
  }


  render() {
    const {
      type,
      iconName,
      disabled,
    } = this.props;
    const { date, time } = this.state;
    let _type;
    let _format;

    if (type === 'date-time') {
      _type = date ? 'time' : 'date';
      _format = date ? 'HH:MM' : 'YYYY-MM-DD';
    } else {
      _type = type;
      _format = type === 'date' ? 'YYYY-MM-DD' : 'HH:MM';
    }

    // if(!time) const var = true;


    return (
      <DatePicker
        style={{ width: 50 }}
        date={date}
        mode={_type}
        format={_format}
        minDate={moment()}
        maxDate="3000-06-01"
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        onDateChange={_datePickerValue => this._setValue(!date ? 'date' : 'time', _datePickerValue)}
        hideText
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
