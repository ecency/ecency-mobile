import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

export default EStyleSheet.create({
  modalView: {} as ViewStyle,
  contentContainer: {
    paddingTop: 10,
  },
  sheetContent: {
    paddingBottom: 30,
    backgroundColor: '$modalBackground',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 20,
    paddingHorizontal: 16,
  } as TextStyle,
  subTitle: {
    textAlign: 'left',
    fontSize: 16,
    paddingHorizontal: 16,
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
  textButton: {
    color: '$primaryDarkGray',
    fontWeight: '700',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  separator: {
    backgroundColor: '$darkIconColor',
    height: 0.5,
  },
  button: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingRight: 16,
  },
  buttonTextWrapper: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
