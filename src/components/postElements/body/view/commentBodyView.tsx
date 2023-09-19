import React, { Fragment, useState } from 'react';
import { View } from 'react-native';
import { useIntl } from 'react-intl';

import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import RootNavigation from '../../../../navigation/rootNavigation';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';
import { PostHtmlRenderer, TextButton } from '../../..';

// Styles
import styles from './commentBodyStyles';

// Services and Actions
import { toastNotification } from '../../../../redux/actions/uiAction';

import { useAppDispatch } from '../../../../hooks';
import { isCommunity } from '../../../../utils/communityValidation';
import { GLOBAL_POST_FILTERS_VALUE } from '../../../../constants/options/filters';
import getWindowDimensions from '../../../../utils/getWindowDimensions';

const WIDTH = getWindowDimensions().width;

interface CommentBodyProps {
  body: string;
  commentDepth: number;
  hideContent: boolean;
  handleOnContentPress: () => void;
  handleOnUserPress: () => void;
  handleOnPostPress: () => void;
  handleOnLongPress: () => void;
  handleVideoPress: () => void;
  handleYoutubePress: () => void;
  handleImagePress: () => void;
  handleLinkPress: () => void;
}

const CommentBody = ({
  body,
  commentDepth,
  hideContent,
  handleOnContentPress,
  handleOnUserPress,
  handleOnPostPress,
  handleOnLongPress,
  handleVideoPress,
  handleYoutubePress,
  handleImagePress,
  handleLinkPress,
}: CommentBodyProps) => {
  const _contentWidth = WIDTH - (40 + 28 + (commentDepth > 2 ? 44 : 0));

  const dispatch = useAppDispatch();

  const [revealComment, setRevealComment] = useState(!hideContent);

  const intl = useIntl();

  const _onLongPressStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      handleOnLongPress();
    }
  };

  const _showLowComment = () => {
    setRevealComment(true);
  };

  const _handleTagPress = (tag: string, filter: string = GLOBAL_POST_FILTERS_VALUE[0]) => {
    if (tag) {
      const name = isCommunity(tag) ? ROUTES.SCREENS.COMMUNITY : ROUTES.SCREENS.TAG_RESULT;
      const key = `${filter}/${tag}`;
      RootNavigation.navigate({
        name,
        params: {
          tag,
          filter,
          key,
        },
      });
    }
  };

  const _handleOnPostPress = (permlink, author) => {
    if (handleOnPostPress) {
      handleOnPostPress(permlink, author);
      return;
    }
    if (permlink) {
      RootNavigation.navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: `@${author}/${permlink}`,
      });
    }
  };


  const _handleOnUserPress = (username) => {
    if (handleOnUserPress) {
      handleOnUserPress(username);
      return;
    }
    if (username) {
      RootNavigation.navigate({
        name: ROUTES.SCREENS.PROFILE,
        params: {
          username,
        },
        key: username,
      });
    } else {
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'post.wrong_link',
          }),
        ),
      );
    }
  };

  return (
    <Fragment>
      {revealComment ? (
        <LongPressGestureHandler onHandlerStateChange={_onLongPressStateChange}>
          <View>
            <PostHtmlRenderer
              contentWidth={_contentWidth}
              body={body}
              isComment={true}
              setSelectedImage={handleImagePress}
              setSelectedLink={handleLinkPress}
              handleOnPostPress={_handleOnPostPress}
              handleOnUserPress={_handleOnUserPress}
              handleTagPress={_handleTagPress}
              handleVideoPress={handleVideoPress}
              handleYoutubePress={handleYoutubePress}
              handleOnContentPress={handleOnContentPress}
            />
          </View>
        </LongPressGestureHandler>
      ) : (
        <TextButton
          style={styles.revealButton}
          textStyle={styles.revealText}
          onPress={() => _showLowComment()}
          text={intl.formatMessage({ id: 'comments.reveal_comment' })}
        />
      )}
    </Fragment>
  );
};

export default CommentBody;
