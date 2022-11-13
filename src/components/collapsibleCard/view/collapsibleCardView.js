import React, { PureComponent } from 'react';
import { View, TouchableHighlight } from 'react-native';
import { View as AnimatedView } from 'react-native-animatable';
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

  constructor(props) {
    super(props);

    this.state = {
      expanded: props.expanded || false,
    };
    this.animatedContainerRef = React.createRef(null);
  }

  _toggleOnPress = () => {
    const { expanded } = this.state;
    if (this.animatedContainerRef.current) {
      this.animatedContainerRef.current.animate({
        0: { height: expanded ? 0 : 200, opacity: expanded ? 0 : 1 },
        1: { height: expanded ? 200 : 0, opacity: expanded ? 1 : 0 },
      });
    }

    const { handleOnExpanded } = this.props;

    this.setState({
      expanded: !expanded,
    });

    if (handleOnExpanded && expanded) {
      handleOnExpanded();
    }
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { isExpanded, locked } = this.props;
    const { expanded } = this.state;

    if (
      (locked || !nextProps.isExpanded) &&
      isExpanded !== nextProps.isExpanded &&
      expanded !== nextProps.isExpanded
    ) {
      this._toggleOnPress();
    }
  }

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

        <AnimatedView ref={this.animatedContainerRef} duration={500}>
          <View style={styles.content}>
            <View style={[!fitContent && !noContainer && styles.contentBody]}>{children}</View>
          </View>
        </AnimatedView>
      </View>
    );
  }
}

export default CollapsibleCardView;