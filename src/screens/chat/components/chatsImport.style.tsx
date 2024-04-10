import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

export default EStyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '$borderColor',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    borderRadius: 30,
  } as ViewStyle,
  modalView: {} as ViewStyle,
  contentContainer: {
    paddingTop: 10,
  },
  sheetContent: {
    paddingBottom: 30,
    backgroundColor: '$modalBackground',
  },
  squareButton: {
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
  } as ViewStyle,
  squareButtonInversion: {
    backgroundColor: '$chartBlue',
  } as ViewStyle,
  actionText: {
    fontSize: 16,
    alignSelf: 'center',
    color: '$chartText',
  },
  actionTextInversion: {
    color: '$white',
  },
  buttonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 50,
  } as ViewStyle,
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 20,
  } as TextStyle,
  subTitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
  } as TextStyle,
  alertView: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgb(189 212 247)',
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    backgroundColor: 'rgb(235 242 252)',
  } as ViewStyle,
  alertText: {
    color: 'rgb(53 124 230)',
  } as ViewStyle,
});
