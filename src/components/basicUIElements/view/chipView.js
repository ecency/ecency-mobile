import React, { Fragment } from 'react';
import { TextInput } from 'react-native';
import styles from './chipStyle';

const Chip = props => (
  <Fragment>
    <TextInput
      style={[styles.textInput, props.isPin && styles.isPin]}
      onChangeText={text => props.handleOnChange(text)}
      onBlur={() => props.handleOnBlur()}
      {...props}
    />
  </Fragment>
);

export default Chip;
