import React, { Component } from 'react';

// Services and Actions

// Middleware

// Constants
import { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';
import { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';
import API_VALUE from '../../../constants/options/api';

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
  _handleDropdownSelected = (action, actionType) => {

    switch (actionType) {
      case 'currency':
        console.log(CURRENCY_VALUE[action]);
        break;

      case 'language':
        console.log(LANGUAGE_VALUE[action]);
        break;

      case 'api':
        console.log(API_VALUE[action]);
        break;

      default:
        break;
    }
  }
  _handleOnChange = (action, type, actionType = null) => {
    switch (type) {
      case 'dropdown':
        this._handleDropdownSelected(action, actionType);
        break;

      case 'toggle':
        console.log(action + type);
        break;

      case 'button':
        console.log(action + type);
        break;
    
      default:
        break;
    }

  };

  render() {
    return <SettingsScreen handleOnChange={this._handleOnChange} {...this.props} />;
  }
}

export default SettingsContainer;
