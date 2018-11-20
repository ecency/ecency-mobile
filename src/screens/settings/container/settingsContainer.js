import React, { Component } from 'react';

// Services and Actions

// Middleware

// Constants
import { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';
import { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';
import { VALUE as API_VALUE } from '../../../constants/options/api';

// Utilities

// Component
import { SettingsScreen } from '..';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class SettingsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions
  _handleDropdownSelected = (actionType) => {
    
    switch (actionType) {
      case 'currency':
        console.log(action + type + CURRENCY_VALUE[action]);

      case 'language':
        console.log(action + type + LANGUAGE_VALUE[action]);

      case 'api':
        console.log(action + type + API_VALUE[action]);

      default:
        break;
    }
  }
  _handleOnChange = (action, type, actionType = null) => {

    switch (type) {
      case 'dropdown':
        this._handleDropdownSelected(actionType);

      case 'toggle':
        console.log(action + type);

      case 'button':
        console.log(action + type);
    
      default:
        break;
    }

  };

  render() {
    return <SettingsScreen handleOnChange={this._handleOnChange} {...this.props} />;
  }
}

export default SettingsContainer;
