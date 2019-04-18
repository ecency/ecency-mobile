import React, { Component, Fragment } from 'react';
import { Text, View, FlatList } from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import { LineBreak } from '../../basicUIElements';
import { IconButton } from '../../iconButton';

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

  // Component Life Cycles

  // Component Functions

  render() {
    const { userActivities, userPoints, intl } = this.props;
    const isActiveIcon = true;

    return (
      <Fragment>
        <LineBreak height={12} />
        <Text style={styles.pointText}>{userPoints.points}</Text>
        <Text style={styles.subText}>eSteem Points</Text>

        <View style={styles.iconsWrapper}>
          <View styles={styles.iconWrapper}>
            <View style={styles.iconWrapper}>
              <IconButton
                iconStyle={styles.icon}
                iconType="MaterialCommunityIcons"
                name="pencil"
                badgeCount={50}
                badgeStyle={styles.badge}
                badgeTextStyle={styles.badgeText}
              />
            </View>
            <Text style={styles.subText}>{intl.formatMessage({ id: 'points.post' })}</Text>
          </View>
          <View styles={styles.iconWrapper}>
            <View style={styles.iconWrapper}>
              <IconButton
                iconStyle={styles.icon}
                iconType="MaterialIcons"
                name="comment"
                badgeCount={15}
                badgeStyle={styles.badge}
                badgeTextStyle={styles.badgeText}
              />
            </View>
            <Text style={styles.subText}>{intl.formatMessage({ id: 'points.comment' })}</Text>
          </View>
          <View styles={styles.iconWrapper}>
            <View style={[styles.iconWrapper, isActiveIcon && styles.activeIconWrapper]}>
              <IconButton
                iconStyle={[styles.icon, isActiveIcon && styles.activeIcon]}
                iconType="MaterialCommunityIcons"
                name="clock-outline"
                badgeCount={50}
                badgeStyle={[styles.badge, isActiveIcon && styles.activeBadge]}
                badgeTextStyle={styles.badgeText}
              />
            </View>
            <Text style={styles.subText}>{intl.formatMessage({ id: 'points.checkin' })}</Text>
          </View>
        </View>

        <FlatList
          data={userActivities}
          renderItem={({ item }) => (
            <Text>{item.type}</Text>
          )}
        />
      </Fragment>
    );
  }
}

export default injectIntl(PointsView);
