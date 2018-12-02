import React, { Component, Fragment } from 'react';
import {
  View, TouchableOpacity, ActivityIndicator, Text,
} from 'react-native';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Slider from 'react-native-slider';
// Constants

// Components
import { Icon } from '../../icon';

// STEEM
import { upvote, upvoteAmount } from '../../../providers/steem/dsteem';
import { decryptKey } from '../../../utils/crypto';
import { getUserData } from '../../../realm/realm';
import { getDigitPinCode } from '../../../providers/steem/auth';

// Styles
import styles from './upvoteStyles';

class UpvoteView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {
      value: 0.0,
      isVoting: false,
      isVoted: props.content ? props.content.is_voted : false,
      amount: '0.00',
      isModalVisible: false,
    };
  }

  // Component Life Cycles

  // Component Functions

  _calculateEstimatedAmount = async () => {
    const { user } = this.props;
    // Calculate total vesting shares
    if (user) {
      const { value } = this.state;
      const totalVests = parseFloat(user.vesting_shares)
        + parseFloat(user.received_vesting_shares)
        - parseFloat(user.delegated_vesting_shares);

      const finalVest = totalVests * 1e6;

      const power = (user.voting_power * (value * 10000)) / 10000 / 50;

      const rshares = (power * finalVest) / 10000;

      const estimated = await upvoteAmount(rshares);

      this.setState({
        amount: estimated.toFixed(3),
      });
    }
  };

  _upvoteContent = async () => {
    const { user, content } = this.props;
    const { value } = this.state;

    let postingKey;
    let userData;

    this.setState({
      isVoting: true,
    });

    const digitPinCode = await getDigitPinCode();

    await getUserData().then((result) => {
      userData = Array.from(result);

      postingKey = decryptKey(userData[0].postingKey, digitPinCode);
    });

    upvote(
      {
        voter: user && user.name,
        author: content && content.author,
        permlink: content && content.permlink,
        weight: value ? (value * 100).toFixed(0) * 100 : 0,
      },
      postingKey,
    )
      .then((res) => {
        this.setState({
          isVoted: !!value,
          isVoting: false,
        });
      })
      .catch((err) => {
        alert(err);
        this.setState({
          isVoted: false,
          isVoting: false,
        });
      });
  };

  render() {
    const { isLoggedIn, isShowPayoutValue, content } = this.props;
    const {
      isVoting, isModalVisible, amount, value, isVoted,
    } = this.state;

    const _percent = `${(value * 100).toFixed(0)}%`;
    const _amount = `$${amount}`;
    return (
      <PopoverController>
        {({
          openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect,
        }) => (
          <Fragment>
            <TouchableOpacity
              start
              ref={setPopoverAnchor}
              onPress={openPopover}
              style={styles.upvoteButton}
              disabled={!isLoggedIn}
            >
              {isVoting ? (
                <ActivityIndicator />
              ) : (
                <Fragment>
                  <Icon
                    style={[styles.upvoteIcon]}
                    active={!isLoggedIn}
                    iconType="AntDesign"
                    name={isVoted ? 'upcircle' : 'upcircleo'}
                  />
                  {isShowPayoutValue && (
                  <Text style={styles.payoutValue}>
                      $
                    {' '}
                    {content && content.pending_payout_value}
                  </Text>
                  )}
                </Fragment>
              )}
            </TouchableOpacity>

            <Popover
              contentStyle={styles.popover}
              arrowStyle={styles.arrow}
              backgroundStyle={styles.overlay}
              visible={popoverVisible}
              onClose={closePopover}
              fromRect={popoverAnchorRect}
              placement="top"
              supportedOrientations={['portrait', 'landscape']}
            >
              <View style={styles.popoverWrapper}>
                <TouchableOpacity
                  onPress={() => {
                    // closePopover();
                    this._upvoteContent();
                  }}
                  style={styles.upvoteButton}
                >
                  {isVoting ? (
                    <ActivityIndicator />
                  ) : (
                    <Icon
                      size={20}
                      style={[styles.upvoteIcon, { color: '#007ee5' }]}
                      active={!isLoggedIn}
                      iconType="AntDesign"
                      name={isVoted ? 'upcircle' : 'upcircleo'}
                    />
                  )}
                </TouchableOpacity>
                <Text style={styles.amount}>{_amount}</Text>
                <Slider
                  style={styles.slider}
                  minimumTrackTintColor="#357ce6"
                  trackStyle={styles.track}
                  thumbStyle={styles.thumb}
                  thumbTintColor="#007ee5"
                  value={value}
                  onValueChange={(value) => {
                    this.setState({ value }, () => {
                      this._calculateEstimatedAmount();
                    });
                  }}
                />
                <Text style={styles.percent}>{_percent}</Text>
              </View>
            </Popover>
          </Fragment>
        )}
      </PopoverController>
    );
  }
}

export default UpvoteView;
