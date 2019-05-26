/* eslint-disable no-nested-ternary */
import React, { Component, Fragment } from 'react';
import { Text, View, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { injectIntl } from 'react-intl';
import { Popover, PopoverController } from 'react-native-modal-popover';
import { get, size } from 'lodash';

// Components
import { LineBreak, WalletLineItem, ListPlaceHolder } from '../../basicUIElements';
import { IconButton } from '../../iconButton';
import { Icon } from '../../icon';
import { MainButton } from '../../mainButton';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Constants
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';

// Styles
import styles from './pointsStyles';

class PointsView extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Functions

  refreshControl = () => {
    const { fetchUserActivity, refreshing, isDarkTheme } = this.props;

    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={fetchUserActivity}
        progressBackgroundColor="#357CE6"
        tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
        titleColor="#fff"
        colors={['#fff']}
      />
    );
  };

  _renderLoading = () => {
    const { isLoading, intl } = this.props;

    if (isLoading) {
      return <ListPlaceHolder />;
    }
    return <Text style={styles.subText}>{intl.formatMessage({ id: 'points.no_activity' })}</Text>;
  };

  render() {
    const { claimPoints, intl, isClaiming, userActivities, userPoints } = this.props;

    return (
      <Fragment>
        <LineBreak height={12} />
        <ScrollView style={styles.scrollContainer} refreshControl={this.refreshControl()}>
          <Text style={styles.pointText}>{userPoints.points}</Text>
          <Text style={styles.subText}>eSteem Points</Text>
          {userPoints.unclaimed_points > 0 && (
            <MainButton
              isLoading={isClaiming}
              isDisable={isClaiming}
              style={styles.mainButton}
              height={50}
              onPress={() => claimPoints()}
            >
              <View style={styles.mainButtonWrapper}>
                <Text style={styles.unclaimedText}>{userPoints.unclaimed_points}</Text>
                <View style={styles.mainIconWrapper}>
                  <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
                </View>
              </View>
            </MainButton>
          )}

          <View style={styles.iconsWrapper}>
            <FlatList
              style={styles.iconsList}
              data={POINTS_KEYS}
              horizontal
              renderItem={({ item }) => (
                <PopoverController key={item.type}>
                  {({
                    openPopover,
                    closePopover,
                    popoverVisible,
                    setPopoverAnchor,
                    popoverAnchorRect,
                  }) => (
                    <View styles={styles.iconWrapper} key={item.type}>
                      <View style={styles.iconWrapper}>
                        <TouchableOpacity ref={setPopoverAnchor} onPress={openPopover}>
                          <IconButton
                            iconStyle={styles.icon}
                            style={styles.iconButton}
                            iconType={POINTS[item.type].iconType}
                            name={POINTS[item.type].icon}
                            badgeCount={POINTS[item.type].point}
                            badgeStyle={styles.badge}
                            badgeTextStyle={styles.badgeText}
                            disabled
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.subText}>
                        {intl.formatMessage({ id: POINTS[item.type].nameKey })}
                      </Text>
                      <Popover
                        backgroundStyle={styles.overlay}
                        contentStyle={styles.popoverDetails}
                        arrowStyle={styles.arrow}
                        visible={popoverVisible}
                        onClose={() => {
                          closePopover();
                        }}
                        fromRect={popoverAnchorRect}
                        placement="top"
                        supportedOrientations={['portrait', 'landscape']}
                      >
                        <View style={styles.popoverWrapper}>
                          <Text style={styles.popoverText}>
                            {intl.formatMessage({ id: POINTS[item.type].descriptionKey })}
                          </Text>
                        </View>
                      </Popover>
                    </View>
                  )}
                </PopoverController>
              )}
            />
          </View>

          <View style={styles.listWrapper}>
            {!userActivities ? (
              this._renderLoading()
            ) : (
              <FlatList
                data={userActivities}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item, index }) => (
                  <WalletLineItem
                    index={index + 1}
                    text={intl.formatMessage({ id: item.textKey })}
                    description={getTimeFromNow(get(item, 'created'))}
                    isCircleIcon
                    isThin
                    isBlackText
                    iconName={get(item, 'icon')}
                    iconType={get(item, 'iconType')}
                    rightText={`${get(item, 'amount')} ESTM`}
                  />
                )}
              />
            )}
          </View>
        </ScrollView>
      </Fragment>
    );
  }
}

export default injectIntl(PointsView);
