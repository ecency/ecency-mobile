import React, { Component } from "react";
import { View, TouchableHighlight, Text, Animated } from "react-native";

// Constants

// Components
import { ContainerHeader } from "../../containerHeader";
// Styles
// eslint-disable-next-line
import styles from "./collapsibleCardStyles";

class CollapsibleCardView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    expanded                - For is collapsible open or close declaration prop.
    *   @prop { type }    children                - Render include children
    *   @prop { type }    title                   - Collapsible title.
    *
    */
  anime = {
    height: new Animated.Value(),
    expanded: false,
    contentHeight: 0,
  };
  constructor(props) {
    super(props);

    this.anime.expanded = props.expanded;

    this.state = {
      expanded: props.expanded || false,
    };
  }

  // Component Life Cycles

  // Component Functions
  _initContentHeight = evt => {
    if (this.anime.contentHeight > 0) return;
    this.anime.contentHeight = evt.nativeEvent.layout.height;
    this.anime.height.setValue(
      this.anime.expanded ? this._getMaxValue() : this._getMinValue()
    );
  };

  _getMaxValue() {
    return this.anime.contentHeight;
  }
  _getMinValue() {
    return 0;
  }

  _toggleOnPress = () => {
    Animated.timing(this.anime.height, {
      toValue: this.anime.expanded ? this._getMinValue() : this._getMaxValue(),
      duration: 200,
    }).start();
    this.anime.expanded = !this.anime.expanded;

    this.setState({
      expanded: this.anime.expanded,
    });
  };

  render() {
    const { title, children, defaultTitle } = this.props;
    const { expanded } = this.state;

    return (
      <View style={styles.container}>
        <TouchableHighlight
          underlayColor="transparent"
          onPress={() => this._toggleOnPress()}
        >
          <ContainerHeader
            fontSize="12"
            color="#788187"
            fontSize={12}
            title={title}
            defaultTitle={defaultTitle}
            iconName={expanded ? "md-arrow-dropdown" : "md-arrow-dropup"}
          />
        </TouchableHighlight>

        <Animated.View
          style={[styles.content, { height: this.anime.height }]}
          onLayout={e => this._initContentHeight(e)}
        >
          <View style={styles.contentBody}>{children}</View>
        </Animated.View>
      </View>
    );
  }
}

export default CollapsibleCardView;
