import React, { PureComponent } from 'react';
import { Animated, Easing } from 'react-native';

export default class Indicator extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      progress: new Animated.Value(0),
    };

    this.mounted = false;
  }

  componentDidMount() {
    const { animating } = this.props;

    this.mounted = true;

    if (animating) {
      this._startAnimation();
    }
  }

  componentDidUpdate(prevProps) {
    const { animating } = this.props;

    if (animating !== prevProps.animating) {
      if (animating) {
        this._stopAnimation();
      } else {
        this._startAnimation();
      }
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  _startAnimation = ({ finished } = {}) => {
    const { progress } = this.state;
    const { interaction, animationEasing, animationDuration } = this.props;

    if (!this.mounted || finished === false) {
      return;
    }

    const animation = Animated.timing(progress, {
      duration: animationDuration,
      easing: animationEasing,
      isInteraction: interaction,
      toValue: 1,
    });

    Animated.loop(animation).start();

    this.setState({ animation });
  };

  _stopAnimation = () => {
    const { animation } = this.state;

    if (animation == null) {
      return;
    }

    animation.stop();

    this.setState({ animation: null });
  };

  _renderComponent = (undefined, index) => {
    const { progress } = this.state;
    const { renderComponent } = this.props;

    if (renderComponent) {
      return renderComponent({ index, progress });
    }

    return null;
  };

  render() {
    const { count, ...props } = this.props;

    return (
      <Animated.View {...props}>
        {Array.from(new Array(count), this._renderComponent)}
      </Animated.View>
    );
  }
}

Indicator.defaultProps = {
  animationEasing: Easing.linear,
  animationDuration: 1200,
  animating: true,
  interaction: true,
  count: 1,
};

export { Indicator };
