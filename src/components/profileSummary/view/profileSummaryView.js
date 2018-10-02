import React, { Component } from "react";
import { View, Image, Text } from "react-native";

// Constants
import TEMP_IMAGE from "../../../assets/drawer-cover.png";

// Components
import { TextWithIcon } from "../../basicUIElements";
import { PercentBar } from "../../basicUIElements";
import { IconButton } from "../../iconButton";
// Styles
// eslint-disable-next-line
import styles from "./profileSummaryStyles";

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

  render() {
    const { percent, hours, location, link, date } = this.props;

    return (
      <View>
        <View style={styles.textWithIconWrapper}>
          <TextWithIcon text={location} iconName="md-navigate" />
          <TextWithIcon isClickable text={link} iconName="md-globe" />
          <TextWithIcon text={date} iconName="md-calendar" />
        </View>
        <View />
        <Image style={styles.longImage} source={TEMP_IMAGE} />
        <PercentBar percent={percent} margin={24}>
          <View style={styles.percentTitleWrapper}>
            <Text style={styles.percentTitle}>
              Voting power: {percent}% - Full in {hours} hours
            </Text>
          </View>
        </PercentBar>
        <View style={styles.footer}>
          <View style={styles.leftIcons}>
            <View style={styles.followCountWrapper}>
              <Text style={styles.followCount}>31K</Text>
              <Text style={styles.followText}>followers</Text>
            </View>
            <View style={styles.followCountWrapper}>
              <Text style={styles.followCount}>31K</Text>
              <Text style={styles.followText}>followers</Text>
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
            <IconButton
              backgroundColor="transparent"
              name="md-more"
              size={16}
              color="#c1c5c7"
            />
          </View>
        </View>
      </View>
    );
  }
}

export default ProfileSummaryView;
