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
    justifyContent: 'flex-start',
    marginHorizontal: 16,
  },
  input: {
    color: '$primaryDarkGray',
    fontSize: 14,
    flexGrow: 1,
    padding: 7,
    maxWidth: '$deviceWidth - 100',
    marginLeft: 8,
  },
  closeIconButton: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    justifyContent: 'center',
    alignSelf: 'center',
    marginRight: 16,
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
    marginLeft: 12,
    marginRight: 4,
  },
});
