import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import getWindowDimensions from '../../../utils/getWindowDimensions';

export default EStyleSheet.create({
  modalStyle:{
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
  },
  checkView: {
    width: getWindowDimensions().width - 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 4,
  } as ViewStyle,

  scrollContainer: {
    flex:1,
    marginTop: 16,
    marginBottom: 16,
  } as ViewStyle,

  informationText: {
    color: '$primaryBlack',
    margin: 10,
    fontSize: 18,
  } as TextStyle,

  modalContainer: {
    flex:1,
    marginBottom: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
 
  } as ViewStyle,

  sectionTextStyle : {
    color:'$primaryBlack',
    fontSize: 16,
    marginHorizontal: 16,
    marginVertical:4,

  } as TextStyle,

  sectionSubTextStyle : {
    color:'$iconColor',
    fontSize: 18,
    marginHorizontal: 16,
    marginVertical:16,
    alignSelf:'center'

  } as TextStyle,

  dragBtnContainer:{
    padding:8
  } as ViewStyle,

  title: {
    color: '$primaryBlack',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  } as TextStyle,

  bodyText: {
    color: '$primaryBlack',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  } as TextStyle,

  btnText: {
    color: '$pureWhite',
    textTransform: 'uppercase'
  } as TextStyle,

  assetIconContainer:{
    width:32,
    marginLeft:16
  },

  button: {
    backgroundColor: '$primaryBlue',
    width: 150,
    paddingVertical: 16,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
});
