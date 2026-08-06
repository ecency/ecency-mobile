import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from '@react-navigation/native';
import { PostStatsContent } from '../children';
import styles from '../styles/postStatsModal.styles';
import ROUTES from '../../../../constants/routeNames';
import { useAppSelector } from '../../../../hooks';
import { selectIsLoggedIn, selectIsPinCodeOpen } from '../../../../redux/selectors';
import { getPostStatsDateRange } from '../../../../providers/queries';

interface PostStatsModalProps {
  post: any;
}

export const PostStatsModal = forwardRef(({ post }: PostStatsModalProps, ref) => {
  const navigation = useNavigation();

  const sheetModalRef = useRef<any>(null);

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isPinCodeOpen = useAppSelector(selectIsPinCodeOpen);

  const [urlPath, setUrlPath] = useState('');

  // Scope stats to the post's lifetime so ClickHouse prunes by its time index
  // instead of scanning all history. Computed per-render (not memoized on
  // `created`) so the `to` bound stays current if the sheet lives across midnight.
  const dateRange = getPostStatsDateRange(post?.created);

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
      permlink: `${post.author}/${post.permlink}`,
      redeemType: 'promote' as const,
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
      {...({ indicatorColor: EStyleSheet.value('$primaryWhiteLightBackground') } as any)}
    >
      <PostStatsContent urlPath={urlPath} dateRange={dateRange} onPromotePress={_onPromotePress} />
    </ActionSheet>
  );
});
