import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '$primaryBackgroundColor',
    flex: 1,
  },
  formStyle: {
    backgroundColor: '$white',
    height: 30,
    marginTop: 8,
  },
  imgLabel: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    color: '$primaryDarkText',
    fontWeight: '500',
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: '$primaryDarkText',
    fontWeight: '500',
  },
  formItem: {
    marginBottom: 12,
  },
  coverImg: {
    borderRadius: 5,
    height: 60,
    marginBottom: 12,
    alignSelf: 'stretch',
    backgroundColor: '$primaryGray',
  },
  coverImageWrapper: {},
  addIcon: {
    color: 'white',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '$primaryBlue',
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    borderColor: '$white',
    borderWidth: 1,
    position: 'absolute',
    bottom: 0,
    right: 10,
  },

  saveButton: {
    backgroundColor: '$primaryBlue',
    width: 55,
    height: 55,
    borderRadius: 55 / 2,
    position: 'absolute',
    top: -25,
    right: 10,
    zIndex: 999,
    borderWidth: 2,
    borderColor: '$white',
  },
  saveIcon: {
    color: '$white',
    textAlign: 'center',
  },

  input: {
    fontSize: 20,
    color: '$primaryBlack',
    alignSelf: 'flex-start',
    width: '100%',
    paddingBottom: 10,
  },
  contentContainer: {
    flexGrow: 1,
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: 0,
    bottom: 8,
  },
});
