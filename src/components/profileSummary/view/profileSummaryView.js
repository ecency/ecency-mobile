import React, { Component, Fragment } from 'react';
import {
  View, Image, Text, TouchableOpacity, Dimensions,
} from 'react-native';
import { DropdownButton } from '../../dropdownButton';

// Constants
import DEFAULT_IMAGE from '../../../assets/default_cover_image.png';

// Components
import { TextWithIcon } from '../../basicUIElements';
import { PercentBar } from '../../percentBar';
import { IconButton } from '../../iconButton';
// Styles
// eslint-disable-next-line
import styles from './profileSummaryStyles';

const DEVICE_WIDTH = Dimensions.get('window').width;

class ProfileSummaryView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {
      isShowPercentText: false,
    };
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { isShowPercentText } = this.state;
    const {
      percentRC,
      percentVP,
      hoursVP,
      hoursRC,
      location,
      link,
      date,
      followingCount,
      followerCount,
      coverImage,
    } = this.props;
    const votingPowerText = `Voting power: ${percentVP}% • Full in ${hoursVP} hours`;
    const rcsPowerText = `RCs: ${percentRC}% • Full in ${hoursRC} hours`;

    /* eslint-disable */
    const rowLength = location
      ? location.length
      : null + link
        ? link.length
        : null + date
          ? date.length
          : null;

    const isColumn = rowLength && DEVICE_WIDTH / rowLength <= 15;

    return (
      <Fragment>
        <View style={[isColumn ? styles.textWithIconWrapperColumn : styles.textWithIconWrapper]}>
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
        <TouchableOpacity onPress={() => this.setState({ isShowPercentText: !isShowPercentText })}>
          <PercentBar
            isShowText={isShowPercentText}
            percent={percentVP}
            margin={24}
            isTop
            text={votingPowerText}
          />
          <PercentBar
            isShowText={isShowPercentText}
            percent={percentRC}
            margin={24}
            barColor="#eafcef"
            barPercentColor="#11c28b"
            textColor="#11c28b"
            isTop={false}
            text={rcsPowerText}
          />
        </TouchableOpacity>

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
      </Fragment>
    );
  }
}

export default ProfileSummaryView;
