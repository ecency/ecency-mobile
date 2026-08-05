import { useNavigation } from '@react-navigation/native';
import React from 'react';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setHidePostsThumbnails } from '../../../redux/actions/applicationActions';
import { selectHidePostsThumbnails } from '../../../redux/selectors';

// Components
import BasicHeaderView from '../view/basicHeaderView';

interface BackHeaderProps {
  backIconName?: 'close' | 'arrow-back';
  isNewPost?: boolean;
  handleOnBackPress?: () => void;
  // passes every remaining prop through to BasicHeaderView
  [key: string]: any;
}

const BasicHeaderContainer = (props: BackHeaderProps) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const isHideImages = useAppSelector(selectHidePostsThumbnails);

  const _handleOnPressBackButton = () => {
    const { isNewPost, handleOnBackPress } = props;

    if (isNewPost) {
      navigation.navigate({ name: ROUTES.SCREENS.FEED, params: undefined });
    } else {
      navigation.goBack();
    }

    if (handleOnBackPress) {
      handleOnBackPress();
    }
  };

  const _handleViewModeToggle = () => {
    dispatch(setHidePostsThumbnails(!isHideImages));
  };

  return (
    <BasicHeaderView
      handleOnPressBackButton={_handleOnPressBackButton}
      handleViewModeToggle={_handleViewModeToggle}
      {...props}
    />
  );
};

export default BasicHeaderContainer;
