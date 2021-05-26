import React, { useEffect, useRef, useState} from 'react';
import { Animated, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { IconButton } from '..';
import { toastNotification } from '../../redux/actions/uiAction';
import UserAvatar from '../userAvatar';

// Styles
import styles, { CONTAINER_HEIGHT } from './styles';

interface Props {
  title:string;
  text:string;
  usename:string;
}


const ForegroundNotification = ({text, title, username }:Props) => {
    let hideTimeout = null;
    const dispatch = useDispatch();

    const [duration] = useState(4000);
    const [curText, setCurText] = useState(text);
    const [isVisible, setIsVisible] = useState(false);
    

    const animatedValue = useRef(new Animated.Value(-CONTAINER_HEIGHT)).current;



    useEffect(() => {
      if(text !== curText && text !== ''){
        setCurText(text);
        show();
      }
      return ()=>{
        if(hideTimeout){
          clearTimeout(hideTimeout);
        }
      }
    }, [text]);

    const show = () => {
      // Will change fadeAnim value to 1 in 5 seconds
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 350
      }).start();

      setIsVisible(true);

      hideTimeout = setTimeout(()=>{
        hide();
      }, duration)

    };
  
    const hide = () => {
      if(hideTimeout || isVisible){
        // Will change fadeAnim value to 0 in 3 seconds
        Animated.timing(animatedValue, {
          toValue: -CONTAINER_HEIGHT,
          duration: 200
        }).start(()=>{
          dispatch(toastNotification(''))
        });

        setIsVisible(false);
        clearTimeout(hideTimeout);
      }
    };



  return (
    <Animated.View
      style={{
        ...styles.container,
        transform: [{ translateY: animatedValue }],
      }}
    >
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingBottom:16, paddingHorizontal:16}}>
        
        <View style={{flexDirection:'row'}}>
          <UserAvatar username={username}/>

          <View>
            <Text style={styles.text}>{title}</Text>
            <Text style={styles.text}>{text}</Text>
          </View>

        </View>
       
     
        <IconButton 
          name='close'
          color="white"
          size={28}
          onPress={hide}
        />
      </View>
      
    </Animated.View>
  )
}


export default ForegroundNotification;
