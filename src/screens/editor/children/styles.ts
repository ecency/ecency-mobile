import EStyleSheet from 'react-native-extended-stylesheet';
import { getBottomSpace } from 'react-native-iphone-x-helper';

export default EStyleSheet.create({

  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    position:'absolute',
    bottom:0,
    left:0, 
    right:0,
    zIndex:999
  },
  thumbStyle:{
      width:72, 
      height:72,
      marginVertical:8,
      marginRight:8,
      borderRadius:12,
      backgroundColor:'$primaryLightGray'
    },
    selectedStyle:{
      borderWidth:4,
      borderColor:'$primaryBlack'
    },
    settingLabel:{
      color: '$primaryDarkGray',
      fontSize: 14,
      fontWeight: 'bold',
      flexGrow: 1,
    },
    listContainer:{
      paddingBottom:getBottomSpace() + 16,
    },
});
