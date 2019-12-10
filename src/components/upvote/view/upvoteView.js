import React, { Component, Fragment } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { injectIntl } from 'react-intl';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Slider from 'react-native-slider';
import get from 'lodash/get';

// Utils
import parseToken from '../../../utils/parseToken';
import { vestsToRshares } from '../../../utils/conversions';
import { getEstimatedAmount } from '../../../utils/vote';

// Components
import { Icon } from '../../icon';
import { PulseAnimation } from '../../animations';
import { TextButton } from '../../buttons';
import { FormattedCurrency } from '../../formatedElements';

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
      sliderValue:
        get(props, 'isVoted', false) ||
        get(props, 'isDownVoted', 1) ||
        get(props, 'upvotePercent', 1),
      isVoting: false,
      isVoted: get(props, 'isVoted', false),
      amount: '0.00000',
      isShowDetails: false,
      downvote: get(props, 'isDownVoted', false),
    };
  }

  // Component Life Cycles
  componentDidMount() {
    this._calculateEstimatedAmount();
  }

  // Component Functions
  _calculateEstimatedAmount = async () => {
    const { currentAccount, globalProps } = this.props;

    if (currentAccount && Object.entries(currentAccount).length !== 0) {
      const { sliderValue } = this.state;

      this.setState({
        amount: getEstimatedAmount(currentAccount, globalProps, sliderValue),
      });
    }
  };

  _upvoteContent = closePopover => {
    const {
      author,
      currentAccount,
      fetchPost,
      handleSetUpvotePercent,
      permlink,
      pinCode,
    } = this.props;
    const { sliderValue, downvote } = this.state;

    if (!downvote) {
      closePopover();
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
    } else {
      this.setState({ sliderValue: 1, downvote: false });
    }
  };

  _downvoteContent = closePopover => {
    const {
      author,
      currentAccount,
      fetchPost,
      handleSetUpvotePercent,
      permlink,
      pinCode,
    } = this.props;
    const { sliderValue, downvote } = this.state;

    if (downvote) {
      closePopover();
      this.setState(
        {
          isVoting: true,
        },
        () => {
          handleSetUpvotePercent(sliderValue);
        },
      );

      const weight = sliderValue ? (sliderValue * 100).toFixed(0) * 100 * -1 : 0;

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
    } else {
      this.setState({ sliderValue: 1, downvote: true });
    }
  };

  _handleOnPopoverClose = () => {
    this.popoverOnClose = setTimeout(() => {
      this.setState({ isShowDetails: false }, () => {
        clearTimeout(this.popoverOnClose);
      });
    }, 300);
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { isVoted, upvotePercent } = this.props;
    const { isVoted: localIsVoted } = this.state;

    if (isVoted !== get(nextProps, 'isVoted') && localIsVoted !== get(nextProps, 'isVoted')) {
      this.setState({ isVoted: get(nextProps, 'isVoted') });
    }

    if (upvotePercent !== get(nextProps, 'upvotePercent')) {
      this.setState({
        sliderValue:
          get(nextProps, 'isVoted', false) ||
          get(nextProps, 'isDownVoted', 1) ||
          get(nextProps, 'upvotePercent', 1),
      });
    }
  }

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
      isDownVoted,
      beneficiaries,
      warnZeroPayout,
      breakdownPayout,
    } = this.props;
    const { isVoting, amount, sliderValue, isVoted, isShowDetails, downvote } = this.state;
    let iconName = 'upcircleo';
    const iconType = 'AntDesign';
    let downVoteIconName = 'downcircleo';

    if (isVoted) {
      iconName = 'upcircle';
    }

    if (isDownVoted) {
      downVoteIconName = 'downcircle';
    }

    const _percent = `${downvote ? '-' : ''}${(sliderValue * 100).toFixed(0)}%`;
    const _amount = `$${amount}`;
    const _totalPayout = totalPayout || '0.000';
    const sliderColor = downvote ? '#ec8b88' : '#357ce6';

    return (
      <PopoverController>
        {({ openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect }) => (
          <Fragment>
            <TouchableOpacity
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
                  <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 5 }}>
                    <Icon
                      style={[styles.upvoteIcon, isDownVoted && { color: '#ec8b88' }]}
                      active={!isLoggedIn}
                      iconType={iconType}
                      name={isDownVoted ? downVoteIconName : iconName}
                    />
                  </View>
                )}
              </Fragment>
            </TouchableOpacity>
            <View style={styles.payoutTextButton}>
              {isShowPayoutValue && (
                <TextButton
                  style={styles.payoutTextButton}
                  textStyle={[styles.payoutValue, isDecinedPayout && styles.declinedPayout]}
                  text={<FormattedCurrency value={_totalPayout} />}
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
                    {promotedPayout > 0 && (
                      <Text style={styles.detailsText}>
                        {`${intl.formatMessage({
                          id: 'payout.promoted',
                        })} ${'~'}$${promotedPayout}`}
                      </Text>
                    )}
                    {pendingPayout > 0 && (
                      <Text style={styles.detailsText}>
                        {`${intl.formatMessage({
                          id: 'payout.potential_payout',
                        })} ${'~'}$${pendingPayout}`}
                      </Text>
                    )}
                    {authorPayout > 0 && (
                      <Text style={styles.detailsText}>
                        {`${intl.formatMessage({
                          id: 'payout.author_payout',
                        })} ${'~'}$${authorPayout}`}
                      </Text>
                    )}
                    {curationPayout > 0 && (
                      <Text style={styles.detailsText}>
                        {`${intl.formatMessage({
                          id: 'payout.curation_payout',
                        })} ${'~'}$${curationPayout}`}
                      </Text>
                    )}
                    {breakdownPayout && pendingPayout > 0 && (
                      <Text style={styles.detailsText}>
                        {`${intl.formatMessage({
                          id: 'payout.breakdown',
                        })} ${breakdownPayout}`}
                      </Text>
                    )}
                    {beneficiaries.length > 0 && (
                      <Text style={styles.detailsText}>
                        {`${intl.formatMessage({
                          id: 'payout.beneficiaries',
                        })} ${beneficiaries}`}
                      </Text>
                    )}
                    <Text style={styles.detailsText}>
                      {`${intl.formatMessage({
                        id: 'payout.payout_date',
                      })} ${payoutDate}`}
                    </Text>
                    {warnZeroPayout && (
                      <Text style={styles.detailsText}>
                        {`${intl.formatMessage({
                          id: 'payout.warn_zero_payout',
                        })}`}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Fragment>
                    <TouchableOpacity
                      onPress={() => {
                        this._upvoteContent(closePopover);
                      }}
                      style={styles.upvoteButton}
                    >
                      <Icon
                        size={20}
                        style={[styles.upvoteIcon, { color: '#007ee5' }]}
                        active={!isLoggedIn}
                        iconType="AntDesign"
                        name={iconName}
                      />
                    </TouchableOpacity>
                    <Text style={styles.amount}>{_amount}</Text>
                    <Slider
                      style={styles.slider}
                      minimumTrackTintColor={sliderColor}
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
                    <TouchableOpacity
                      onPress={() => this._downvoteContent(closePopover)}
                      style={styles.upvoteButton}
                    >
                      <Icon
                        size={20}
                        style={[styles.upvoteIcon, { color: '#ec8b88' }]}
                        active={!isLoggedIn}
                        iconType="AntDesign"
                        name={downVoteIconName}
                      />
                    </TouchableOpacity>
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
