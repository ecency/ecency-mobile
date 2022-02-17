import React, { Fragment } from 'react';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Text, View } from 'react-native';
import { BasicHeader, Icon, MainButton } from '../../components';

// utils
import { getReferralsList } from '../../providers/ecency/ecency';

// styles
import styles from './referScreenStyles';

const ReferScreen = ({ navigation }) => {
  const intl = useIntl();

  useEffect(() => {
    _getReferralsList();
  }, []);
  const _getReferralsList = async () => {
    const referralsList = await getReferralsList('good-karma');
    console.log('referralsList : ', referralsList);
  };
  const _renderPointsEarned = () => {
    return (
      <View style={styles.pointsEarnedContainer}>
        <Text style={styles.points}>1000</Text>
        <Text style={styles.earendText}>Points Earned</Text>
        <MainButton
          // isLoading={isClaiming}
          // isDisable={isClaiming}
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
  const _renderReferralsList = () => {
    return (
      <View style={styles.referralsListContainer}>
        <Text>Referrals List</Text>
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
