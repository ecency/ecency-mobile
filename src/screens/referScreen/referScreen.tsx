import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, FlatList, Share, Text, TouchableOpacity, View } from 'react-native';
import {
  BasicHeader,
  Icon,
  ListPlaceHolder,
  MainButton,
  PopoverWrapper,
  UserListItem,
} from '../../components';
import get from 'lodash/get';
// utils
import { getReferralsList } from '../../providers/ecency/ecency';
import { Referral } from '../../models';

// styles
import styles from './referScreenStyles';
import { useAppSelector } from '../../hooks';
import { navigate } from '../../navigation/service';

// constants
import ROUTES from '../../constants/routeNames';

const ReferScreen = ({ navigation }) => {
  const intl = useIntl();
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [referralsList, setReferralsList] = useState<Referral[]>([]);
  const [earnedPoints, setEarnedPoint] = useState(0);
  const [pendingPoints, setPendingPoint] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    _getReferralsList();
  }, []);

  console.log('-----referralsList----- : ', referralsList);

  const _getReferralsList = async () => {
    setLoading(true);
    const referralsListData = await getReferralsList('ecency'); // using 'good-karma' name for testing, use original name here
    // const referralsListData = await getReferralsList(currentAccount.name);
    let rewardedPoints = 0;
    let unrewardedPoint = 0;
    referralsListData.forEach((value) => {
      if (value.isRewarded) {
        rewardedPoints += 100;
      } else {
        unrewardedPoint += 100;
      }
    });
    setLoading(false);
    setReferralsList(referralsListData as any);
    setEarnedPoint(rewardedPoints);
    setPendingPoint(unrewardedPoint);
  };

  const _handleRefer = () => {
    const shareUrl = `https://ecency.com/signup?referral=${currentAccount.username}`;
    Share.share({
      message: shareUrl,
    });
  };

  const _handleDelegateHP = (item: Referral) => {
    console.log('delegate HP!');
    navigate({
      routeName: ROUTES.SCREENS.TRANSFER,
      params: {
        transferType: 'delegate',
        fundType: 'HIVE_POWER',
        referredUsername: item.referredUsername,
      },
    });
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
      />
    );
  };
  const _renderReferralsList = () => {
    return (
      <View style={styles.referralsListContainer}>
        <FlatList
          data={referralsList}
          // refreshing={refreshing}
          keyExtractor={(item, index) => `item ${index}`}
          removeClippedSubviews={false}
          ListEmptyComponent={_renderEmptyView}
          // onRefresh={() => fetchLeaderBoard()}
          renderItem={_renderReferralListItem}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
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
      <View style={styles.mainContainer}>
        {_renderPointsEarned()}
        {_renderReferralsList()}
      </View>
    </Fragment>
  );
};

export default ReferScreen;
