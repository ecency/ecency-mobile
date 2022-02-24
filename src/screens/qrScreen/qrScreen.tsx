import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import { View, Text } from 'react-native';
import { BasicHeader } from '../../components';

// styles
import styles from './qrScreenStyle';

//
const QRScreen = () => {
  const intl = useIntl();

  return (
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({
          id: 'qr.qr_scan',
        })}
      />
      <View style={styles.mainContainer}>
        <Text>QR Screen</Text>
      </View>
    </Fragment>
  );
};

export default QRScreen;
