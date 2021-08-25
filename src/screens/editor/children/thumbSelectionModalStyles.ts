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
      width:100, 
      height:100,
      margin:8,
      borderRadius:12,
      backgroundColor:'$primaryLightGray'
    },
    selectedStyle:{
      borderWidth:4,
      borderColor:'$primaryBlack'
    },
    title:{
      color: '$primaryBlack',
      fontWeight: 'bold',
      fontSize: 18,
      padding: 16,
      textAlign:'center'
    },
    listContainer:{
      paddingHorizontal:8,  
      paddingBottom:getBottomSpace() + 16,
    }
});
