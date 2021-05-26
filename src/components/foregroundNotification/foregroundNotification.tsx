import React, { Component } from 'react';
import { Animated, TouchableOpacity, Text, View } from 'react-native';
import { IconButton } from '..';
import UserAvatar from '../userAvatar';

// Styles
import styles from './styles';

interface Props {
  text:string;
}

const ForegroundNotification = ({text}:Props) => {
  const position = {top:0};
  return (
    <View
      style={{
        ...styles.container,
        ...position,
        // transform: [{ translateY: 0 }],
      }}
    >
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingBottom:16, paddingHorizontal:16}}>
        
        <UserAvatar username="demo.com"/>

        <View>
          <Text style={styles.text}>New Upvote</Text>
          <Text style={styles.text}>{text}</Text>
        </View>
     
        <IconButton 
          name='close'
          color="white"
          size={28}
        />
      </View>
      
    </View>
  )
}

// class ToastNotification extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     animatedValue: new Animated.Value(0),
  //   };
  // }

  // Component Functions
  // _showToast() {
  //   const { duration } = this.props;
  //   const animatedValue = new Animated.Value(0);

  //   this.setState({ animatedValue });

  //   Animated.timing(animatedValue, { toValue: 1, duration: 350 }).start();

  //   if (duration) {
  //     this.closeTimer = setTimeout(() => {
  //       this._hideToast();
  //     }, duration);
  //   }
  // }

  // _hideToast() {
  //   const { animatedValue } = this.state;
  //   const { onHide } = this.props;

  //   Animated.timing(animatedValue, { toValue: 0.0, duration: 350 }).start(() => {
  //     if (onHide) {
  //       onHide();
  //     }
  //   });

  //   if (this.closeTimer) {
  //     clearTimeout(this.closeTimer);
  //   }
  // }

  // Component Life Cycles
  // UNSAFE_componentWillMount() {
  //   this._showToast();
  // }

//   render() {
//     const { text, textStyle, style, onPress, isTop } = this.props;
//     const { animatedValue } = this.state;
//     const outputRange = isTop ? [-50, 0] : [50, 0];
//     const y = animatedValue.interpolate({
//       inputRange: [0, 1],
//       outputRange,
//     });
//     const position = isTop ? { top: 100 } : { bottom: 100 };

//     return (
//       <TouchableOpacity disabled={!onPress} onPress={() => onPress && onPress()}>
//         <Animated.View
//           style={{
//             ...styles.container,
//             ...style,
//             ...position,
//             opacity: animatedValue,
//             transform: [{ translateY: y }],
//           }}
//         >
//           <Text style={[styles.text, textStyle]}>{text}</Text>
//         </Animated.View>
//       </TouchableOpacity>
//     );
//   }
// }

export default ForegroundNotification;
