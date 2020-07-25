import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: '5%',
    paddingHorizontal: 40,
  },
  welcomeText: {
    fontSize: 34,
  },
  ecencyText: {
    fontSize: 34,
    color: '$primaryBlue',
  },
  sectionRow: {
    flexDirection: 'row',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
  },
  sectionText: {
    fontSize: 15,
    marginLeft: 10,
    marginRight: 45,
  },
  flex1: {
    flex: 1,
  },
});
