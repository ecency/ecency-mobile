import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import { Text, View } from 'react-native';
import { BasicHeader } from '../../components';

// styles
import styles from './referScreenStyles';

const ReferScreen = ({ navigation }) => {
  const intl = useIntl();

  return (
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({
          id: 'refer.refer_earn',
        })}
      />
    </Fragment>
  );
};

export default ReferScreen;
