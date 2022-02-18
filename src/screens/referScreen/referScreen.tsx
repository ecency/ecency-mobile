import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { BasicHeader, Icon, MainButton, PopoverWrapper, UserListItem } from '../../components';
import get from 'lodash/get';
// utils
import { getReferralsList } from '../../providers/ecency/ecency';
import { Referral } from '../../models';

// styles
import styles from './referScreenStyles';

const ReferScreen = ({ navigation }) => {
  const intl = useIntl();
  const [referralsList, setReferralsList] = useState<Referral[]>([]);
  const [earnedPoints, setEarnedPoint] = useState(0);
  const [pendingPoints, setPendingPoint] = useState(0);
  useEffect(() => {
    _getReferralsList();
  }, []);

  console.log('-----referralsList----- : ', referralsList);

  const _getReferralsList = async () => {
    // using 'good-karma' name for testing
    const referralsListData = await getReferralsList('good-karma');
    let rewardedPoints = 0;
    let unrewardedPoint = 0;
    referralsListData.forEach((value) => {
      if (value.isRewarded) {
        rewardedPoints += 100;
      } else {
        unrewardedPoint += 100;
      }
    });
    setReferralsList(referralsListData as any);
    setEarnedPoint(rewardedPoints);
    setPendingPoint(unrewardedPoint);
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
            <Text style={styles.pendingText}>
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
          onPress={() => console.log('pressed!')}
        >
          <View style={styles.mainButtonWrapper}>
            <Text style={styles.unclaimedText}>
              {intl.formatMessage({
                id: 'refer.refer',
              })}
            </Text>
            <View style={styles.mainIconWrapper}>
              <Icon name="share-social-outline" iconType="Ionicons" color="#fff" size={28} />
            </View>
          </View>
        </MainButton>
      </View>
    );
  };

  const RewardItem = ({ rewarded }) => {
    return (
      <PopoverWrapper
        text={
          rewarded
            ? intl.formatMessage({
                id: 'refer.rewarded',
              })
            : intl.formatMessage({
                id: 'refer.not_rewarded',
              })
        }
      >
        <Text style={[styles.dollarSign, rewarded ? styles.blueDollarSign : {}]}>$$</Text>
      </PopoverWrapper>
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
  const _rightItemRenderer = () => {
    return (
      <View style={styles.rightItemRendererContainer}>
        <Text style={styles.rightItemText}>
          {intl.formatMessage({
            id: 'refer.delegate_hp',
          })}
        </Text>
      </View>
    );
  };
  const _renderReferralListItem = ({ item, index }: { item: Referral; index: number }) => {
    return (
      <UserListItem
        key={get(item, '_id')}
        index={index}
        username={item.referredUsername}
        description={get(item, 'created')}
        // isHasRightItem
        // isClickable
        isBlackRightColor
        // rightText={item.isRewarded ? 'Rewarded' : 'Not Rewarded'}
        isLoggedIn
        // itemIndex={index + 1}
        // handleOnPress={() => console.log('pressed!')}
        // rightTextStyle={styles.rewardText}
        // rightTooltipText={intl.formatMessage({ id: 'leaderboard.tooltip_earn' })}
        leftItemRenderer={() => _leftItemRenderer(item)}
        rightItemRenderer={_rightItemRenderer}
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
          // ListEmptyComponent={<ListPlaceHolder />}
          // onRefresh={() => fetchLeaderBoard()}
          renderItem={_renderReferralListItem}
          contentContainerStyle={styles.listContentContainer}
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
      {_renderPointsEarned()}
      {_renderReferralsList()}
    </Fragment>
  );
};

export default ReferScreen;
