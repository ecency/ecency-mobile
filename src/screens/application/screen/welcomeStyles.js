import EStyleSheet from 'react-native-extended-stylesheet';
import scalePx from '../../../utils/scalePx';

export default EStyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  container: {
    flex: 0.95,
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  welcomeText: {
    fontSize: scalePx(34),
  },
  ecencyText: {
    fontSize: scalePx(34),
    color: '$primaryBlue',
  },
  mascot: {
    position: 'absolute',
    width: 160,
    height: 227,
    marginTop: 40,
    right: 0,
    opacity: 0.5,
  },
  topText: {
    marginTop: 40,
  },
  sectionRow: {
    flexDirection: 'row',
  },
  sectionTitle: {
    fontSize: scalePx(17),
    fontWeight: '600',
    marginLeft: 10,
  },
  sectionText: {
    fontSize: scalePx(15),
    marginLeft: 10,
    marginRight: 45,
  },
  flex1: {
    flex: 1,
  },
});
