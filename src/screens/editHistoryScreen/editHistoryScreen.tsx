import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {  Text, View } from 'react-native';
import {
  BasicHeader,
} from '../../components';

// styles
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './editHistoryScreenStyles';

const EditHistoryScreen = ({ navigation }) => {
  const intl = useIntl();
  return (
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({
          id: 'history.edit',
        })}
      />
      <View style={styles.mainContainer}>
        <Text>
          Edit History Screen
        </Text>
      </View>
    </Fragment>
  );
};

export default EditHistoryScreen;
