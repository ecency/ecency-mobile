import EStyleSheet from 'react-native-extended-stylesheet';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

export const CONTAINER_HEIGHT = getStatusBarHeight() + 72;

export default EStyleSheet.create({
  containerIOS: {
    position: 'absolute',
    zIndex: 9999,
    justifyContent: 'flex-end',
    maxWidth: '$deviceWidth',
    minWidth: '$deviceWidth / 1.9',
    height: CONTAINER_HEIGHT,
    width:'100%',
    backgroundColor: '$primaryDarkText',
    shadowOffset: {
      height: 5,
    },
    shadowColor: '#5f5f5fbf',
    shadowOpacity: 0.3,
    elevation: 3,
    top:0,
  },
  containerAndroid:{
    position: 'absolute',
    top:0,
    justifyContent:'center',
    zIndex: 9999,
    marginHorizontal:8,
    paddingTop:16,
    marginTop:8,
    backgroundColor: '$primaryDarkText',
    shadowColor: '#5f5f5fbf',
    shadowOpacity: 0.3,
    shadowOffset: {
      height: 5,
    },
    elevation: 3,
    borderRadius:12,
    width: '$deviceWidth - 16',
  },
  text: {
    flex:1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    paddingLeft:16,
  },
});
