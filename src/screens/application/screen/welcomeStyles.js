import EStyleSheet from 'react-native-extended-stylesheet';
import scalePx from '../../../utils/scalePx';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 100,
    paddingHorizontal: 40,
    backgroundColor: '$primaryBackgroundColor',
  },
  welcomeText: {
    fontSize: scalePx(34),
    color: '$primaryBlack',
  },
  ecencyText: {
    fontSize: scalePx(34),
    color: '$primaryBlue',
  },
  mascot: {
    position: 'absolute',
    width: 160,
    height: 227,
    marginTop: 90,
    right: 0,
    opacity: 0.7,
    shadowColor: '$primaryBlack',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    overflow: 'visible',
  },
  topText: {
    marginTop: 40,
  },
  sectionRow: {
    flexDirection: 'row',
    marginTop: 64,
  },
  sectionTitle: {
    fontSize: scalePx(17),
    fontWeight: '600',
    marginLeft: 10,
    color: '$primaryBlack',
  },
  sectionText: {
    fontSize: scalePx(15),
    marginLeft: 10,
    marginRight: 45,
    color: '$primaryBlack',
  },
  flex1: {
    flex: 1,
  },
});
