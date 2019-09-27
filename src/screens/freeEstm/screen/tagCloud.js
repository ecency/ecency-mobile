import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default class TagCloud extends Component {
  constructor(props) {
    super(props);

    this.TagCloud = this.orderData().map((item, key) => {
      const tagContainerStyle = {
        paddingLeft: this.getRandomPaddingLeft(),
        paddingTop: this.getRandomPaddingTop(),
        paddingRight: this.getRandomPaddingRight(),
        paddingBottom: this.getRandomPaddingBottom(),
      };

      const tagStyle = {
        fontSize: this.props.minFontSize + item.point * 4,
        color: this.props.colorList[item.point],
      };

      return (
        <View key={key} style={tagContainerStyle}>
          <Text style={tagStyle}>{item.title}</Text>
        </View>
      );
    });
  }

  orderData() {
    const result = [];
    const { tagList } = this.props;
    tagList.sort((a, b) => {
      if (a.point === b.point) return 0;
      return a.point > b.point ? -1 : 1;
    });

    const maxPoint = tagList[0].point;
    let switchFlag = true;
    tagList.map((item, key) => {
      if (maxPoint === item.point) {
        result.push(item);
        return;
      }

      if (switchFlag) {
        result.unshift(item);
        switchFlag = false;
      } else {
        result.push(item);
        switchFlag = true;
      }
    });

    return result;
  }

  getRandomPaddingLeft() {
    return Math.floor(Math.random() * this.props.tagPaddingLeft);
  }

  getRandomPaddingTop() {
    return Math.floor(Math.random() * this.props.tagPaddingTop);
  }

  getRandomPaddingRight() {
    return Math.floor(Math.random() * this.props.tagPaddingRight);
  }

  getRandomPaddingBottom() {
    return Math.floor(Math.random() * this.props.tagPaddingBottom);
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <View style={styles.cloudTagContainer}>{this.TagCloud}</View>
      </View>
    );
  }
}

TagCloud.defaultProps = {
  tagList: [],
  colorList: ['#357ce6', '#4da1f1', '#357ce6', '#357ce6', '#4da1f1', '#357ce6'],
  minFontSize: 10,
  tagPaddingLeft: 20,
  tagPaddingTop: 20,
  tagPaddingRight: 20,
  tagPaddingBottom: 20,
};
