import { get, isEmpty, some } from 'lodash';
import React, { useEffect, useRef, useState} from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { IconButton } from '..';
import { toastNotification } from '../../redux/actions/uiAction';
import UserAvatar from '../userAvatar';
import ROUTES from '../../constants/routeNames';

// Styles
import styles, { CONTAINER_HEIGHT } from './styles';
import { navigate } from '../../navigation/service';
import { useIntl } from 'react-intl';
import { Platform } from 'react-native';

interface RemoteMessage {
  data:{
    id:string;
    source:string;
    target:string;
    permlink1:string;
    permlink2:string;
    permlink3:string;
    type:'reblog'|'reply';
  };
  notification:{
    body:string;
    title:string;
  }

}

interface Props {
  remoteMessage:RemoteMessage
}


const ForegroundNotification = ({remoteMessage}:Props) => {
    let hideTimeout = null;
    const dispatch = useDispatch();
    const intl = useIntl();

    const [duration] = useState(50000);
    const [activeId, setActiveId] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    

    const animatedValue = useRef(new Animated.Value(-CONTAINER_HEIGHT)).current;


    useEffect(() => {

      if(remoteMessage){
        const {source, target, type, id} = remoteMessage.data;

        if(activeId !== id){
          switch(type){
            case 'reply':
              setTitle(`${intl.formatMessage({id:'notification.reply_on'})} @${target}`);
              setBody(intl.formatMessage({id:'notification.reply_body'}));
              break;
            case 'reblog':
              setTitle(`@${target}${intl.formatMessage({id:'notification.reblog_on'})}`);
              setBody(intl.formatMessage({id:'notification.reblog_body'}));
              break;
          }
          
          setActiveId(id);
          setUsername(source);
          show();
        }
      }

      return ()=>{
        if(hideTimeout){
          clearTimeout(hideTimeout);
        }
      }
    }, [remoteMessage]);

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


    const _onPress = () => {
      const {data} = remoteMessage;
      const fullPermlink =
        get(data, 'permlink1', '') + get(data, 'permlink2', '') + get(data, 'permlink3', '');

      let params:any = {};
      let key = '';
      let routeName = '';
      switch(data.type){
        case 'reblog':
          params = {
            author: get(remoteMessage, 'target', ''),
            permlink: fullPermlink,
          };
          key = fullPermlink;
          routeName =  ROUTES.SCREENS.POST;
          break;
        case 'reply':
          params = {
            author: get(remoteMessage, 'source', ''),
            permlink: fullPermlink,
          };
          key = fullPermlink;
          routeName = ROUTES.SCREENS.POST;
          break;
        }

        if (!some(params, isEmpty)) {
          navigate({
            routeName,
            params,
            key,
          });
        }
    }


    const containerStyle = Platform.select({
      ios:styles.containerIOS,
      android:styles.containerAndroid
    })

  return (
    <Animated.View
      style={{
        ...styles.container,
        transform: [{ translateY: animatedValue }],
      }}
    >
      <View style={styles.contentContainer}>
        
        <TouchableOpacity onPress={_onPress} style={{flexShrink:1}}>
          <View style={{flexDirection:'row', alignItems:'center', marginRight:24}}>
            <UserAvatar username={username}/>

            <View style={{flexShrink:1}}>
              <Text style={styles.text} numberOfLines={1}>{title}</Text>
              <Text style={styles.text} numberOfLines={1}>{body}</Text>
            </View>
          </View>
        </TouchableOpacity>

       
     
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
