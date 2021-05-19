import React from 'react';
import { withNavigation } from 'react-navigation';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { hidePostsThumbnails } from '../../../redux/actions/uiAction';

// Components
import BasicHeaderView from '../view/basicHeaderView';

const BasicHeaderContainer = (props) => {
  const dispatch = useAppDispatch();
  const isHideImages = useAppSelector((state) => state.ui.hidePostsThumbnails);

  const _handleOnPressBackButton = () => {
    const { navigation, isNewPost, handleOnBackPress } = props;

    if (isNewPost) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.FEED,
      });
    } else {
      navigation.goBack();
    }

    if (handleOnBackPress) {
      handleOnBackPress();
    }
  };

  const _handleViewModeToggle = () => {
    dispatch(hidePostsThumbnails(!isHideImages));
  };

  return (
    <BasicHeaderView
      handleOnPressBackButton={_handleOnPressBackButton}
      handleViewModeToggle={_handleViewModeToggle}
      {...props}
    />
  );
};

export default withNavigation(BasicHeaderContainer);
