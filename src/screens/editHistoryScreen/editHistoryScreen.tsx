import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {  Alert, Text, View } from 'react-native';
import {
  BasicHeader,
} from '../../components';

// styles
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './editHistoryScreenStyles';
import { getCommentHistory } from '../../providers/ecency/ecency';
import { CommentHistoryItem } from '../../providers/ecency/ecency.types';

const EditHistoryScreen = ({ navigation }) => {
  const {author, permlink} = navigation.state.params;
  const intl = useIntl();
  const [editHistory, setEditHistory] = useState<CommentHistoryItem[]>([])

  useEffect(() => {
    _getCommentHistory();
  },[])

  const _getCommentHistory = async () => {
    const responseData = await getCommentHistory(author, permlink);
    if(!responseData){
      Alert.alert('No History found!')
      return;
    }
    setEditHistory(responseData);
  }
  console.log('author, permlink : ', author, permlink);
  console.log('editHistory : ', editHistory);
  
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
