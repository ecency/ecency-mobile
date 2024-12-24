import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from '@react-navigation/native';
import { PostStatsContent } from '../children';
import styles from '../styles/postStatsModal.styles';
import ROUTES from '../../../../constants/routeNames';
import { useAppSelector } from '../../../../hooks';

interface PostStatsModalProps {
  post: any;
}

export const PostStatsModal = forwardRef(({ post }: PostStatsModalProps, ref) => {
  const navigation = useNavigation();

  const sheetModalRef = useRef<ActionSheet>();

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);

  const [urlPath, setUrlPath] = useState('');

  useImperativeHandle(ref, () => ({
    show(_urlPath: string) {
      setUrlPath(_urlPath);
      sheetModalRef.current?.show();
    },
  }));

  const _onPromotePress = () => {
    if (!isLoggedIn) {
      return;
    }

    const routeName = ROUTES.SCREENS.REDEEM;
    const params = {
      from: 1,
      permlink: `${post.author}/${post.permlink}`,
      redeemType: 'promote',
    };

    sheetModalRef.current?.hide();
    if (isPinCodeOpen) {
      navigation.navigate({
        name: ROUTES.SCREENS.PINCODE,
        params: {
          navigateTo: routeName,
          navigateParams: params,
        },
      });
      return;
    }

    navigation.navigate(routeName, params);
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    >
      <PostStatsContent urlPath={urlPath} onPromotePress={_onPromotePress} />
    </ActionSheet>
  );
});
