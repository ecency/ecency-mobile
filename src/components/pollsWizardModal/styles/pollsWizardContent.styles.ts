import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 56,
  } as ViewStyle,
  label: {
    fontSize: 16,
    color: '$primaryDarkText',
    marginTop: 16,
  } as TextStyle,
  addChoice: {
    paddingTop: 12,
    color: '$primaryBlue',
    fontWeight: 'bold',
  } as TextStyle,
  settingsTitle: {
    fontWeight: '400',
    fontSize: 16,
  },
  settingsWrapper: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 12,
    borderBottomColor: 'transparent',
    height: 44,
  } as ViewStyle,
  input: {
    color: '$primaryDarkText',
  } as TextStyle,
  btnRemove: {
    marginTop: 8,
    marginLeft: 4,
  },
  actionPanel: {
    marginTop: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  } as ViewStyle,
  btnReset: {
    paddingRight: 12,
  } as TextStyle,
  btnMain: {
    paddingHorizontal: 16,
  } as ViewStyle,
  separator: {
    width: '80%',
    height: EStyleSheet.hairlineWidth,
    backgroundColor: '$primaryLightGray',
    marginTop: 24,
    marginBottom: 16,
    alignSelf: 'center',
  } as ViewStyle,
});
