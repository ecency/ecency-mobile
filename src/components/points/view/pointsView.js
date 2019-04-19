import React, { Component, Fragment } from 'react';
import {
  Text, View, FlatList, ScrollView, RefreshControl,
} from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import { LineBreak, WalletLineItem } from '../../basicUIElements';
import { IconButton } from '../../iconButton';

// Utils
import { getTimeFromNow } from '../../../utils/time';

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
   }

   render() {
     const {
       userActivities, userPoints, intl,
     } = this.props;
     const isActiveIcon = true;

     return (
       <Fragment>
         <LineBreak height={12} />
         <ScrollView
           refreshControl={this.refreshControl()}
         >
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

           <View style={styles.listWrapper}>
             <FlatList
               data={userActivities}
               renderItem={({ item, index }) => (
                 <WalletLineItem
                   key={item.id.toString()}
                   index={index + 1}
                   text={intl.formatMessage({ id: item.textKey })}
                   description={getTimeFromNow(item.created)}
                   isCircleIcon
                   isThin
                   isBlackText
                   iconName={item.icon}
                   iconType={item.iconType}
                   rightText={`${item.amount} ESTEEM`}
                 />
               )}
             />
           </View>
         </ScrollView>
       </Fragment>
     );
   }
}

export default injectIntl(PointsView);
