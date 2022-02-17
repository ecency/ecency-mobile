import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { FlatList, Text, View } from 'react-native';
import { BasicHeader, Icon, MainButton, UserListItem } from '../../components';
import get from 'lodash/get';
// utils
import { getReferralsList } from '../../providers/ecency/ecency';
import { Referral } from '../../models';

// styles
import styles from './referScreenStyles';

const ReferScreen = ({ navigation }) => {
  const intl = useIntl();
  const [referralsList, setReferralsList] = useState<Referral[]>([]);
  useEffect(() => {
    _getReferralsList();
  }, []);

  console.log('-----referralsList----- : ', referralsList);

  const _getReferralsList = async () => {
    const referralsListData = await getReferralsList('good-karma');
    setReferralsList(referralsListData as any);
  };
  const _renderPointsEarned = () => {
    return (
      <View style={styles.pointsEarnedContainer}>
        <Text style={styles.points}>1000</Text>
        <Text style={styles.earendText}>Points Earned</Text>
        <MainButton
          // isLoading={isLoading}
          // isDisable={isLoading}
          style={styles.mainButton}
          height={50}
          onPress={() => console.log('pressed!')}
        >
          <View style={styles.mainButtonWrapper}>
            <Text style={styles.unclaimedText}>Refer</Text>
            <View style={styles.mainIconWrapper}>
              <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
            </View>
          </View>
        </MainButton>
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
        isHasRightItem
        isClickable
        isBlackRightColor
        rightText={item.isRewarded ? 'Rewarded' : 'Not Rewarded'}
        isLoggedIn
        itemIndex={index + 1}
        handleOnPress={() => console.log('pressed!')}
        rightTextStyle={styles.rewardText}
        // rightTooltipText={intl.formatMessage({ id: 'leaderboard.tooltip_earn' })}
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
