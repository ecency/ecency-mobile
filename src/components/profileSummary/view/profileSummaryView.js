import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';
import { DropdownButton } from '../../dropdownButton';

// Constants
import DEFAULT_IMAGE from '../../../assets/default_cover_image.png';

// Components
import { TextWithIcon } from '../../basicUIElements';
import { PercentBar } from '../../basicUIElements';
import { IconButton } from '../../iconButton';
// Styles
// eslint-disable-next-line
import styles from './profileSummaryStyles';

class ProfileSummaryView extends Component {
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
  _getFollowerCount = () => {
    const { followerCount } = this.props;
    return 32;
  };

  _getFollowingCount = () => {
    const { followingCoung } = this.props;
    return 32;
  };

  render() {
    const {
      percent,
      hours,
      location,
      link,
      date,
      followingCount,
      followerCount,
      coverImage,
    } = this.props;
    const votingPowerText = `Voting power:${{ percent }}% • Full in ${{ hours }}hours`;
    const rcsPowerText = 'RCs: 20% • Full in 36 hours';

    return (
      <View>
        <View style={styles.textWithIconWrapper}>
          <TextWithIcon text={location} iconName="md-navigate" />
          <TextWithIcon isClickable text={link} iconName="md-globe" />
          <TextWithIcon text={date} iconName="md-calendar" />
        </View>
        <View />
        <Image
          style={styles.longImage}
          source={{ uri: coverImage }}
          defaultSource={DEFAULT_IMAGE}
        />

        <PercentBar percent={percent} margin={24} isTop text={votingPowerText} />
        <PercentBar
          percent={percent}
          margin={24}
          barColor="#eafcef"
          barPercentColor="#11c28b"
          textColor="#11c28b"
          isTop={false}
          text={rcsPowerText}
        />

        <View style={styles.footer}>
          <View style={styles.leftIcons}>
            <View style={styles.followCountWrapper}>
              <Text style={styles.followCount}>{followerCount}</Text>
              <Text style={styles.followText}>followers</Text>
            </View>
            <View style={styles.followCountWrapper}>
              <Text style={styles.followCount}>{followingCount}</Text>
              <Text style={styles.followText}>following</Text>
            </View>
          </View>
          <View style={styles.rightIcons}>
            <IconButton
              backgroundColor="transparent"
              name="ios-heart"
              size={16}
              style={styles.insetIconStyle}
              color="#c1c5c7"
            />
            <IconButton
              backgroundColor="transparent"
              name="md-person-add"
              size={16}
              style={styles.insetIconStyle}
              color="#c1c5c7"
            />
            <DropdownButton
              style={styles.insetIconStyle}
              options={['option1', 'option2', 'option3', 'option4']}
              iconName="md-more"
              isHasChildIcon
              childIconWrapperStyle={styles.dropdownIconStyle}
            />
          </View>
        </View>
      </View>
    );
  }
}

export default ProfileSummaryView;
