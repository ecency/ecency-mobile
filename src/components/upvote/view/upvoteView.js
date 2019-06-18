import React, { Component, Fragment } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { injectIntl } from 'react-intl';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Slider from 'react-native-slider';
import get from 'lodash/get';

// Utils
import parseToken from '../../../utils/parseToken';
import { vestsToRshares } from '../../../utils/conversions';

// Components
import { Icon } from '../../icon';
import { PulseAnimation } from '../../animations';
import { TextButton } from '../../buttons';
import { FormatedCurrency } from '../../formatedElements';

// STEEM
import { vote } from '../../../providers/steem/dsteem';

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
      sliderValue: get(props, 'upvotePercent', 1),
      isVoting: false,
      isVoted: get(props, 'isVoted', false),
      amount: '0.00000',
      isShowDetails: false,
    };
  }

  // Component Life Cycles
  componentDidMount() {
    this._calculateEstimatedAmount();
  }

  componentWillReceiveProps(nextProps) {
    const { isVoted, upvotePercent } = this.props;
    const { isVoted: localIsVoted } = this.state;

    if (isVoted !== get(nextProps, 'isVoted') && localIsVoted !== get(nextProps, 'isVoted')) {
      this.setState({ isVoted: get(nextProps, 'isVoted') });
    }

    if (upvotePercent !== get(nextProps, 'upvotePercent')) {
      this.setState({ sliderValue: get(nextProps, 'upvotePercent') });
    }
  }

  // Component Functions
  _calculateEstimatedAmount = async () => {
    const { currentAccount, globalProps } = this.props;

    if (currentAccount && Object.entries(currentAccount).length !== 0) {
      const { sliderValue } = this.state;
      const { fundRecentClaims, fundRewardBalance, base, quote } = globalProps;

      const votingPower = currentAccount.voting_power;
      const totalVests =
        parseToken(get(currentAccount, 'vesting_shares')) +
        parseToken(get(currentAccount, 'received_vesting_shares')) -
        parseToken(get(currentAccount, 'delegated_vesting_shares'));
      const votePct = sliderValue * 10000;

      const rShares = vestsToRshares(totalVests, votingPower, votePct);
      const estimated = (rShares / fundRecentClaims) * fundRewardBalance * (base / quote);

      this.setState({
        amount: estimated.toFixed(5),
      });
    }
  };

  _upvoteContent = async () => {
    const {
      author,
      currentAccount,
      fetchPost,
      handleSetUpvotePercent,
      permlink,
      pinCode,
    } = this.props;
    const { sliderValue } = this.state;

    this.setState(
      {
        isVoting: true,
      },
      () => {
        handleSetUpvotePercent(sliderValue);
      },
    );

    const weight = sliderValue ? (sliderValue * 100).toFixed(0) * 100 : 0;

    vote(currentAccount, pinCode, author, permlink, weight)
      .then(() => {
        this.setState(
          {
            isVoted: !!sliderValue,
            isVoting: false,
          },
          () => {
            if (fetchPost) {
              fetchPost();
            }
          },
        );
      })
      .catch(err => {
        Alert.alert('Failed!', err.message);
        this.setState({
          isVoted: false,
          isVoting: false,
        });
      });
  };

  _handleOnPopoverClose = () => {
    this.popoverOnClose = setTimeout(() => {
      this.setState({ isShowDetails: false }, () => {
        clearTimeout(this.popoverOnClose);
      });
    }, 300);
  };

  render() {
    const {
      isDecinedPayout,
      isLoggedIn,
      isShowPayoutValue,
      totalPayout,
      pendingPayout,
      promotedPayout,
      authorPayout,
      curationPayout,
      payoutDate,
      intl,
    } = this.props;
    const { isVoting, amount, sliderValue, isVoted, isShowDetails } = this.state;

    let iconName = 'ios-arrow-dropup';
    let iconType;

    if (isVoted) {
      iconName = 'upcircle';
      iconType = 'AntDesign';
    }

    const _percent = `${(sliderValue * 100).toFixed(0)}%`;
    const _amount = `$${amount}`;
    const _totalPayout = totalPayout || '0.000';

    return (
      <PopoverController>
        {({ openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect }) => (
          <Fragment>
            <TouchableOpacity
              start
              ref={setPopoverAnchor}
              onPress={openPopover}
              style={styles.upvoteButton}
              disabled={!isLoggedIn}
            >
              <Fragment>
                {isVoting ? (
                  <View style={{ width: 19 }}>
                    <PulseAnimation
                      color="#357ce6"
                      numPulses={1}
                      diameter={20}
                      speed={100}
                      duration={1500}
                      isShow={!isVoting}
                    />
                  </View>
                ) : (
                  <Icon
                    style={[styles.upvoteIcon]}
                    active={!isLoggedIn}
                    iconType={iconType}
                    name={iconName}
                  />
                )}
              </Fragment>
            </TouchableOpacity>
            <View style={styles.payoutTextButton}>
              {isShowPayoutValue && (
                <TextButton
                  style={styles.payoutTextButton}
                  textStyle={[styles.payoutValue, isDecinedPayout && styles.declinedPayout]}
                  text={<FormatedCurrency value={_totalPayout} />}
                  onPress={() => {
                    openPopover();
                    this.setState({ isShowDetails: true });
                  }}
                />
              )}
            </View>

            <Popover
              contentStyle={isShowDetails ? styles.popoverDetails : styles.popoverSlider}
              arrowStyle={isShowDetails ? styles.arrow : styles.hideArrow}
              backgroundStyle={styles.overlay}
              visible={popoverVisible}
              onClose={() => {
                closePopover();
                this._handleOnPopoverClose();
              }}
              fromRect={popoverAnchorRect}
              placement="top"
              supportedOrientations={['portrait', 'landscape']}
            >
              <View style={styles.popoverWrapper}>
                {isShowDetails ? (
                  <View>
                    <Text style={styles.detailsText}>
                      {`${intl.formatMessage({
                        id: 'payout.promoted',
                      })} ${promotedPayout > 0 ? '~' : ''}$${promotedPayout}`}
                    </Text>
                    <Text style={styles.detailsText}>
                      {`${intl.formatMessage({
                        id: 'payout.potential_payout',
                      })} ${pendingPayout > 0 ? '~' : ''}$${pendingPayout}`}
                    </Text>
                    <Text style={styles.detailsText}>
                      {`${intl.formatMessage({
                        id: 'payout.author_payout',
                      })} ${authorPayout > 0 ? '~' : ''}$${authorPayout}`}
                    </Text>
                    <Text style={styles.detailsText}>
                      {`${intl.formatMessage({
                        id: 'payout.curation_payout',
                      })} ${curationPayout > 0 ? '~' : ''}$${curationPayout}`}
                    </Text>
                    <Text style={styles.detailsText}>
                      {`${intl.formatMessage({
                        id: 'payout.payout_date',
                      })} ${payoutDate}`}
                    </Text>
                  </View>
                ) : (
                  <Fragment>
                    <TouchableOpacity
                      onPress={() => {
                        closePopover();
                        this._upvoteContent();
                      }}
                      style={styles.upvoteButton}
                    >
                      <Icon
                        size={20}
                        style={[styles.upvoteIcon, { color: '#007ee5' }]}
                        active={!isLoggedIn}
                        iconType={iconType}
                        name={iconName}
                      />
                    </TouchableOpacity>
                    <Text style={styles.amount}>{_amount}</Text>
                    <Slider
                      style={styles.slider}
                      minimumTrackTintColor="#357ce6"
                      trackStyle={styles.track}
                      thumbStyle={styles.thumb}
                      thumbTintColor="#007ee5"
                      value={sliderValue}
                      onValueChange={value => {
                        this.setState({ sliderValue: value }, () => {
                          this._calculateEstimatedAmount();
                        });
                      }}
                    />
                    <Text style={styles.percent}>{_percent}</Text>
                  </Fragment>
                )}
              </View>
            </Popover>
          </Fragment>
        )}
      </PopoverController>
    );
  }
}

export default injectIntl(UpvoteView);
