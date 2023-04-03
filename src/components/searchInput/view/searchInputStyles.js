import EStyleSheet from 'react-native-extended-stylesheet';
import { isRTL } from '../../../utils/I18nUtils';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  inputWrapper: {
    marginTop: 20,
    backgroundColor: '$primaryLightBackground',
    flexDirection: 'row',
    height: 44,
    borderRadius: 8,
    padding: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  inputContainer: {
    flex: 0.9,
  },
  input: {
    color: '$primaryDarkGray',
    fontSize: 14,
    padding: 7,
    maxWidth: '$deviceWidth - 100',
    marginLeft: 8,
  },
  closeIconButton: {
    borderRadius: 0,
    flex: 0.1,
  },
  closeIcon: {
    color: '$iconColor',
    fontSize: 22,
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
    justifyContent: 'center',
    transform: [{ rotate: isRTL() ? '-180deg' : '0deg' }],
  },
  backButtonContainer: {
    flex: 1,
    marginTop: 20,
    marginRight: 4,
  },
});
