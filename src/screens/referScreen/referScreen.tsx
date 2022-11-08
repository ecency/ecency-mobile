import React, { Fragment, useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import get from 'lodash/get';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useDispatch } from 'react-redux';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import {
  BasicHeader,
  Icon,
  ListPlaceHolder,
  MainButton,
  PopoverWrapper,
  UserListItem,
} from '../../components';
// utils
import { getReferralsList, getReferralsStats } from '../../providers/ecency/ecency';
import { Referral } from '../../models';

// styles
import styles from './referScreenStyles';

// constants
import ROUTES from '../../constants/routeNames';

// Redux / Services
import { showProfileModal } from '../../redux/actions/uiAction';
import RootNavigation from '../../navigation/rootNavigation';
import { useAppSelector } from '../../hooks';

const ReferScreen = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

  const [referralsList, setReferralsList] = useState<Referral[]>([]);
  const [earnedPoints, setEarnedPoint] = useState(0);
  const [pendingPoints, setPendingPoint] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    _getReferralsStats();
    _getReferralsList();
  }, []);

  console.log('-----referralsList----- : ', referralsList);

  const _getReferralsList = async (refresh?: boolean) => {
    if (refresh) {
      setRefreshing(true);
    }
    setLoading(true);

    const lastReferralId =
      refresh || !referralsList.length ? null : referralsList[referralsList.length - 1]._id;

    const responseData = await getReferralsList(currentAccount.name, lastReferralId);

    setReferralsList(refresh ? responseData : [...referralsList, ...responseData]);
    setRefreshing(false);
    setLoading(false);
  };

  const _getReferralsStats = async () => {
    setLoading(true);

    const referralStats = await getReferralsStats(currentAccount.name);
    const earnedPoints = referralStats.rewarded * 100;
    const unearnedPoints = (referralStats.total - referralStats.rewarded) * 100;
    setEarnedPoint(earnedPoints);
    setPendingPoint(unearnedPoints);
    setLoading(false);
  };

  const _handleRefer = () => {
    const shareUrl = `https://ecency.com/signup?referral=${currentAccount.username}`;
    Share.share({
      message: shareUrl,
    });
  };

  const _handleDelegateHP = (item: Referral) => {
    console.log('delegate HP!');
    RootNavigation.navigate({
      name: ROUTES.SCREENS.TRANSFER,
      params: {
        transferType: 'delegate',
        fundType: 'HIVE_POWER',
        referredUsername: item.referredUsername,
      },
    });
  };

  const _handleOnItemPress = (username: string) => {
    dispatch(showProfileModal(username));
  };

  const _renderPointsEarned = () => {
    return (
      <View style={styles.pointsContainer}>
        <View style={styles.pointsEarnedRow}>
          <View style={styles.earnedWrapper}>
            <Text style={styles.points}>{earnedPoints}</Text>
            <Text style={styles.earendText}>
              {intl.formatMessage({
                id: 'refer.earned',
              })}
            </Text>
          </View>
          <View style={styles.pendingWrapper}>
            <Text style={styles.points}>{pendingPoints}</Text>
            <Text style={styles.earendText}>
              {intl.formatMessage({
                id: 'refer.pending',
              })}
            </Text>
          </View>
        </View>
        <MainButton
          // isLoading={isLoading}
          // isDisable={isLoading}
          style={styles.mainButton}
          height={50}
          onPress={_handleRefer}
        >
          <View style={styles.mainButtonWrapper}>
            <Text style={styles.unclaimedText}>
              {intl.formatMessage({
                id: 'refer.refer',
              })}
            </Text>
            <View style={styles.mainIconWrapper}>
              <Icon name="share-social" iconType="Ionicons" color="#fff" size={28} />
            </View>
          </View>
        </MainButton>
      </View>
    );
  };

  const _leftItemRenderer = (item: Referral) => {
    return (
      <PopoverWrapper
        text={
          item.isRewarded
            ? intl.formatMessage({
                id: 'refer.rewarded',
              })
            : intl.formatMessage({
                id: 'refer.not_rewarded',
              })
        }
      >
        <Text style={[styles.dollarSign, item.isRewarded ? styles.blueDollarSign : {}]}>$$</Text>
      </PopoverWrapper>
    );
  };

  const _rightItemRenderer = (item: Referral) => {
    return (
      <TouchableOpacity
        style={styles.rightItemRendererContainer}
        onPress={() => _handleDelegateHP(item)}
      >
        <Text style={styles.rightItemText}>
          {intl.formatMessage({
            id: 'refer.delegate_hp',
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  const _renderEmptyView = loading ? (
    <ListPlaceHolder />
  ) : (
    <Text style={styles.emptyText}>{intl.formatMessage({ id: 'refer.empty_text' })}</Text>
  );

  const _renderFooterView = (
    <View style={{ height: 72, justifyContent: 'center' }}>
      {loading && <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} />}
    </View>
  );

  const _renderReferralListItem = ({ item, index }: { item: Referral; index: number }) => {
    return (
      <UserListItem
        key={get(item, '_id')}
        index={index}
        username={item.referredUsername}
        description={get(item, 'created')}
        // isClickable
        isBlackRightColor
        isLoggedIn
        leftItemRenderer={() => _leftItemRenderer(item)}
        rightItemRenderer={() => _rightItemRenderer(item)}
        handleOnPress={_handleOnItemPress}
      />
    );
  };
  const _renderReferralsList = () => {
    return (
      <View style={styles.referralsListContainer}>
        <FlatList
          data={referralsList}
          keyExtractor={(item, index) => `item ${index}`}
          removeClippedSubviews={false}
          ListEmptyComponent={_renderEmptyView}
          ListHeaderComponent={_renderPointsEarned}
          ListFooterComponent={_renderFooterView}
          renderItem={_renderReferralListItem}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={() => _getReferralsList()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => _getReferralsList(true)}
              progressBackgroundColor="#357CE6"
              tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
              titleColor="#fff"
              colors={['#fff']}
            />
          }
        />
      </View>
    );
  };
  return (
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({
          id: 'refer.refer_earn',
        })}
      />
      <View style={styles.mainContainer}>{_renderReferralsList()}</View>
    </Fragment>
  );
};

export default gestureHandlerRootHOC(ReferScreen);
