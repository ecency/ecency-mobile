import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './quickReplyModalStyles';
import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { MainButton, TextButton, TextInput, UserAvatar } from '..';
import { useSelector } from 'react-redux';

export interface QuickReplyModalProps {}

const QuickReplyModal = ({}: QuickReplyModalProps, ref) => {
  const intl = useIntl();
  const currentAccount = useSelector((state) => state.account.currentAccount);

  const [selectedPost, setSelectedPost] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  const [expand, setExpand] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sheetModalRef = useRef<ActionSheet>();

  // reset the state when post changes
  useEffect(() => {
    setExpand(false);
    setCommentValue('');
  }, [selectedPost]);

  //CALLBACK_METHODS
  useImperativeHandle(ref, () => ({
    show: (post: any) => {
      console.log('Showing action modal');
      setSelectedPost(post);
      sheetModalRef.current?.setModalVisible(true);
    },
  }));

  //VIEW_RENDERERS

  const _renderInitialView = () => {
    return (
      <View style={styles.intialView}>
        <UserAvatar username={currentAccount.name} disableSize style={styles.userAvatar} />
        <TextButton
          text={intl.formatMessage({
            id: 'quick_reply.placeholder',
          })}
          onPress={() => setExpand(true)}
          style={styles.addCommentBtn}
          textStyle={styles.btnText}
        />
      </View>
    );
  };

  const _renderFullView = () => {
    return (
      <View style={styles.fullView}>
        <View style={styles.modalHeader}>
          <TextButton
            text={selectedPost.title}
            onPress={() => console.log('title pressed!')}
            style={styles.titleBtn}
            textStyle={styles.titleBtnTxt}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={setCommentValue}
            value={commentValue}
            autoFocus
            placeholder={intl.formatMessage({
              id: 'quick_reply.placeholder',
            })}
            placeholderTextColor="#c1c5c7"
            autoCapitalize="none"
            style={styles.textInput}
            multiline={true}
            numberOfLines={5}
          />
        </View>
        <View style={styles.footer}>
          <MainButton
            style={styles.commentBtn}
            onPress={() => console.log('comment pressed!')}
            text={intl.formatMessage({
              id: 'quick_reply.reply',
            })}
            isLoading={isLoading}
          />
        </View>
      </View>
    );
  };
  const _renderContent = () => {
    return (
      <View style={styles.modalContainer}>
        {!expand && _renderInitialView()}
        {expand && _renderFullView()}
      </View>
    );
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={false}
      hideUnderlay
      containerStyle={styles.sheetContent}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    >
      {selectedPost && _renderContent()}
    </ActionSheet>
  );
};

export default forwardRef(QuickReplyModal);
