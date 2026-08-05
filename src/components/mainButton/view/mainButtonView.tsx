import React, { Component, Fragment } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

// Components
import { Icon } from '../../icon';

// Styles
import styles from './mainButtonStyles';

interface MainButtonProps {
  text?: string;
  secondText?: string;
  isLoading?: boolean;
  isDisable?: boolean;
  onPress?: (event?: any) => void;
  iconName?: string;
  iconType?: string;
  iconColor?: string;
  iconPosition?: string;
  iconStyle?: StyleProp<any>;
  // image source rendered instead of a glyph (avatar-style buttons)
  source?: any;
  renderIcon?: React.ReactNode;
  textStyle?: StyleProp<TextStyle>;
  secondTextStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  bodyWrapperStyle?: StyleProp<ViewStyle>;
  height?: number;
  children?: React.ReactNode;
}

interface MainButtonState {
  isDisable: boolean;
}

class MainButton extends Component<MainButtonProps, MainButtonState> {
  constructor(props: MainButtonProps) {
    super(props);

    this.state = {
      isDisable: !!(!props.isLoading && props.isDisable),
    };
  }

  // Component Functions
  _handleOnPress = () => {
    const { onPress } = this.props;

    if (onPress) {
      onPress();
    }
  };

  _getBody = () => {
    const {
      isLoading,
      text,
      secondText,
      iconColor,
      iconName,
      source,
      iconType,
      textStyle,
      secondTextStyle,
      iconPosition,
      iconStyle,
      renderIcon,
    } = this.props;

    if (isLoading) {
      this._getIndicator();
    }

    const iconComponent =
      renderIcon ||
      (source ? (
        <Image source={source} style={styles.image} resizeMode="contain" />
      ) : (
        iconName && (
          <Icon
            iconType={iconType || 'MaterialIcons'}
            color={iconColor}
            name={iconName}
            style={[styles.icon, iconStyle]}
          />
        )
      ));

    if (text) {
      return (
        <Fragment>
          {iconPosition !== 'right' && iconComponent}
          <Text
            style={[
              styles.text,
              iconPosition === 'right' && { paddingLeft: 24, paddingRight: 0 },
              textStyle,
            ]}
          >
            {text}
            {secondText && <Text style={[styles.secondText, secondTextStyle]}>{secondText}</Text>}
          </Text>
          {iconPosition === 'right' && iconComponent}
        </Fragment>
      );
    }

    return (
      <Icon
        iconType={iconType || 'MaterialIcons'}
        color={iconColor}
        name={iconName}
        style={styles.icon}
      />
    );
  };

  _getIndicator = () => <ActivityIndicator color="white" style={styles.activityIndicator} />;

  // Component Life Cycles
  UNSAFE_componentWillReceiveProps(nextProps: MainButtonProps) {
    const { isLoading, isDisable } = this.props;
    if (nextProps.isLoading !== isLoading || nextProps.isDisable !== isDisable) {
      this.setState({
        isDisable: !!(!nextProps.isLoading && nextProps.isDisable),
      });
    }
  }

  render() {
    const { wrapperStyle, children, height, style, isLoading, bodyWrapperStyle } = this.props;
    const { isDisable } = this.state;

    return (
      <View style={wrapperStyle}>
        <TouchableOpacity
          disabled={isLoading || isDisable}
          onPress={this._handleOnPress}
          style={[
            styles.touchable,
            isDisable && styles.disableTouchable,
            height && { height },
            style && style,
          ]}
        >
          <View style={[styles.body, bodyWrapperStyle]}>
            {isLoading ? this._getIndicator() : children || this._getBody()}
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default MainButton;
