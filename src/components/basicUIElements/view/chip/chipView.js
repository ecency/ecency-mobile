import React, { Fragment } from 'react';
import { TextInput } from '../../../textInput';

import styles from './chipStyle';

const Chip = props => (
  <Fragment>
    <TextInput
      allowFontScaling
      style={[styles.textInput, props.isPin && styles.isPin]}
      onChangeText={text => props.handleOnChange(text)}
      onBlur={() => props.handleOnBlur()}
      {...props}
    />
  </Fragment>
);

export default Chip;
