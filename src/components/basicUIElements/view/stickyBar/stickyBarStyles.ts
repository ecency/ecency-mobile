import EStyleSheet from 'react-native-extended-stylesheet';
import roundPx from '../../../../utils/roundPx';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    width: '100%',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    elevation: 3,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: roundPx(0),
  },
});
