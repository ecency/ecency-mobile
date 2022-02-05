import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ImageStyle } from 'react-native-fast-image';

export default EStyleSheet.create({
  cardContainer: {
    backgroundColor:'$primaryLightBlue',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  } as ViewStyle,

  cardHeader:{
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal: 16,
    paddingTop:16,
  } as ViewStyle,

  cardTitleContainer:{
    marginHorizontal: 8,
    flex:1,
  } as ViewStyle,

  logo:{
    height:24, 
    width:24, 
    borderRadius:12, 
    backgroundColor:'grey',
    marginRight: 8,
  } as ImageStyle,

  menuIcon:{
    color: '$primaryBlue',
    paddingLeft:12,
  } as ViewStyle,

  header: {
    backgroundColor: '$primaryBackgroundColor',
  },
  dotStyle: {
    backgroundColor: '$primaryDarkText',
  },
});