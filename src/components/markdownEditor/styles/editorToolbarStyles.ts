import EStyleSheet from 'react-native-extended-stylesheet';
import { getBottomSpace } from 'react-native-iphone-x-helper';

export default EStyleSheet.create({
  container: {
    width:'$deviceWidth',
    backgroundColor: '$primaryBackgroundColor',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    elevation: 3,
  },
  buttonsContainer:{
    justifyContent:'space-between',
    flexDirection: 'row',
    width:'$deviceWidth',
    backgroundColor:'$primaryBackgroundColor',
    paddingBottom:getBottomSpace()
  },
  clearIcon: {
    color: '$primaryLightGray',
  },
  rightIcons: {
    marginRight: 20,
  },
  editorButton: {
    color: '$primaryDarkGray',
    marginRight: 15,
    height: 24,
  },  
  leftButtonsWrapper: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '$deviceWidth / 3',
  },
  rightButtonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    color: '$editorButtonColor',
  },
  clearButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    width: 56,
    backgroundColor: '$primaryBlue',
  },
});
