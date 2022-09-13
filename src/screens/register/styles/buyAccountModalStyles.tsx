import { TextStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  modalStyle: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 8
  },

  container:{
    flex:1
  },

  userInfoContainer:{
   marginBottom:8,
   alignItems: 'baseline'
  },

  userInfoWrapper:{
    backgroundColor:'$primaryBlue',
    borderTopRightRadius:16,
    borderBottomRightRadius:16,
    paddingHorizontal:16,
    paddingVertical:4,
  },

  usernameStyle:{
    fontSize:18,
    color:'$pureWhite',
    fontWeight:'bold'
  } as TextStyle,

  emailStyle:{
    fontSize:18,
    color:'$pureWhite'
  },

  contentContainer: {
    flex:1,
    justifyContent: 'space-around',
    backgroundColor: '$primaryBackgroundColor',

  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
    backgroundColor: '$primaryBackgroundColor',
  },

  logoEstm: {
    width: '$deviceWidth / 1.4',
    height: '$deviceHeight / 3',
  },
  desc: {
    width: '$deviceWidth / 1.5',
    fontSize: 16,
    textAlign: 'center',
    color: '$primaryDarkGray',
  },
  productsWrapper: {
    paddingTop: 8,
    paddingBottom: 52,
    marginHorizontal: 16,
  },

});
