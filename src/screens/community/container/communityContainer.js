import { useState, useEffect } from 'react';
import { withNavigation } from 'react-navigation';
import get from 'lodash/get';
import { connect, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';

import { getCommunity, getSubscriptions } from '../../../providers/hive/dhive';

import { subscribeCommunity, leaveCommunity } from '../../../redux/actions/communitiesAction';

import ROUTES from '../../../constants/routeNames';

const CommunityContainer = ({ children, navigation, currentAccount, pinCode, isLoggedIn }) => {
  const [data, setData] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userRole, setUserRole] = useState('guest');
  const tag = get(navigation, 'state.params.tag');
  const dispatch = useDispatch();
  const intl = useIntl();

  useEffect(() => {
    getCommunity(tag)
      .then((res) => {
        //TODO: manipulate community data here to force make member of tearm
        setData(res);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [tag]);

  useEffect(() => {
    if (data) {
      getSubscriptions(currentAccount.username)
        .then((result) => {
          if (result) {
            const _isSubscribed = result.some((item) => item[0] === data.name);
            setIsSubscribed(_isSubscribed);

            if (_isSubscribed && userRole === 'guest') {
              //if userRole default value is not overwritten,
              //means user is not a part of community core team, so setting as member
              setUserRole('member');
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });

      //check and set user role
      if (data.team && currentAccount) {
        const member = data.team.find((m) => m[0] === currentAccount.username);
        const role = member ? member[1] : userRole;
        setUserRole(role);
      }
    }
  }, [data]);

  const _handleSubscribeButtonPress = () => {
    const _data = {
      isSubscribed: isSubscribed,
      communityId: data.name,
    };
    const screen = 'communitiesScreenDiscoverTab';
    let subscribeAction;
    let successToastText = '';
    let failToastText = '';

    if (!_data.isSubscribed) {
      subscribeAction = subscribeCommunity;

      successToastText = intl.formatMessage({
        id: 'alert.success_subscribe',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_subscribe',
      });
    } else {
      subscribeAction = leaveCommunity;

      successToastText = intl.formatMessage({
        id: 'alert.success_leave',
      });
      failToastText = intl.formatMessage({
        id: 'alert.fail_leave',
      });
    }

    dispatch(
      subscribeAction(currentAccount, pinCode, _data, successToastText, failToastText, screen),
    );
    setIsSubscribed(!isSubscribed);
  };

  const _handleNewPostButtonPress = () => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.EDITOR,
      key: 'editor_community_post',
      params: {
        community: [tag],
      },
    });
  };

  return (
    children &&
    children({
      data,
      handleSubscribeButtonPress: _handleSubscribeButtonPress,
      handleNewPostButtonPress: _handleNewPostButtonPress,
      isSubscribed,
      isLoggedIn,
      userRole,
    })
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isLoggedIn: state.application.isLoggedIn,
});

export default connect(mapStateToProps)(withNavigation(CommunityContainer));
