import React from 'react';
import { View } from 'react-native';
import { useIntl } from 'react-intl';

import { BasicHeader, Comments } from '../../../components';

// Styles
import globalStyles from '../../../globalStyles';

const CommentsScreen = ({ navigation }) => {
  const intl = useIntl();
  const comments = navigation.getParam('comments', [{}])[0];

  return (
    <View style={globalStyles.container}>
      <BasicHeader
        title={intl.formatMessage({
          id: 'comments.title',
        })}
      />
      <View style={globalStyles.containerHorizontal16}>
        <Comments
          isShowComments
          author={comments.author}
          mainAuthor={comments.author}
          permlink={comments.permlink}
          commentCount={comments.children}
          isShowMoreButton={true}
          isShowSubComments
          showAllComments
          fetchPost={navigation.getParam('fetchPost', null)}
          handleOnVotersPress={navigation.getParam('handleOnVotersPress', null)}
          hasManyComments={false}
          hideManyCommentsButton
        />
      </View>
    </View>
  );
};

export { CommentsScreen as Comments };
