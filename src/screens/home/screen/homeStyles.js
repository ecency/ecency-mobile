import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  root: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  buttonContainer: {
    width: '50%',
    alignItems: 'center',
  },
  tabView: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  tabbar: {
    alignSelf: 'center',
    height: 40,
    backgroundColor: '$primaryBackgroundColor',
  },
  tabbarItem: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    minWidth: '$deviceWidth',
  },
  container: {
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  tabs: {
    flex: 1,
  },
  placeholder: {
    backgroundColor: 'white',
    padding: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 5,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
  },
  header: {
    backgroundColor: '#284b78',
    borderBottomWidth: 0,
    borderColor: '#284b78',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '$white',
  },
  searchButton: {
    color: '$white',
    fontWeight: 'bold',
  },
  loginButton: {
    alignSelf: 'center',
    marginTop: 100,
  },
});
