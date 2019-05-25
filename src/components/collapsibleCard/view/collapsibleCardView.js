import React, { PureComponent } from 'react';
import { View, TouchableHighlight, Animated } from 'react-native';

// Constants

// Components
import { ContainerHeader } from '../../containerHeader';
// Styles
import styles from './collapsibleCardStyles';

class CollapsibleCardView extends PureComponent {
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

  componentWillReceiveProps(nextProps) {
    const { isExpanded, moreHeight, locked } = this.props;
    const { expanded } = this.state;

    if (
      (locked || !nextProps.isExpanded) &&
      isExpanded !== nextProps.isExpanded &&
      expanded !== nextProps.isExpanded
    ) {
      this._toggleOnPress();
    }

    if (moreHeight !== nextProps.moreHeight) {
      this.anime.height.setValue(this._getMaxValue() + nextProps.moreHeight);
    }
  }

  // Component Functions
  _initContentHeight = event => {
    if (this.anime.contentHeight > 0) return;
    this.anime.contentHeight = event.nativeEvent.layout.height;
    this.anime.height.setValue(this.anime.expanded ? this._getMaxValue() : this._getMinValue());
  };

  _getMaxValue = () => this.anime.contentHeight;

  _getMinValue = () => 0;

  _toggleOnPress = () => {
    const { handleOnExpanded, moreHeight } = this.props;
    Animated.timing(this.anime.height, {
      toValue: this.anime.expanded ? this._getMinValue() : this._getMaxValue() + (moreHeight || 0),
      duration: 200,
    }).start();
    this.anime.expanded = !this.anime.expanded;

    this.setState({
      expanded: this.anime.expanded,
    });

    if (handleOnExpanded && this.anime.expanded) handleOnExpanded();
  };

  render() {
    const {
      title,
      children,
      defaultTitle,
      fontSize,
      titleColor,
      isBoldTitle,
      locked,
      titleComponent,
      noBorder,
      fitContent,
      isTitleCenter,
      style,
      noContainer,
    } = this.props;
    const { expanded } = this.state;

    return (
      <View style={[styles.container, !noBorder && styles.containerWithBorder, style]}>
        <TouchableHighlight
          underlayColor="transparent"
          onPress={() => !locked && this._toggleOnPress()}
        >
          {titleComponent || (
            <ContainerHeader
              isCenter={isTitleCenter}
              color={titleColor || '#788187'}
              fontSize={fontSize || 12}
              title={title}
              defaultTitle={defaultTitle}
              isBoldTitle={isBoldTitle}
              iconName={expanded ? 'arrow-drop-down' : 'arrow-drop-up'}
            />
          )}
        </TouchableHighlight>

        <Animated.View
          style={[styles.content, { height: this.anime.height, opacity: expanded ? 1 : 0 }]}
          onLayout={e => this._initContentHeight(e)}
        >
          <View style={[!fitContent && !noContainer && styles.contentBody]}>{children}</View>
        </Animated.View>
      </View>
    );
  }
}

export default CollapsibleCardView;
