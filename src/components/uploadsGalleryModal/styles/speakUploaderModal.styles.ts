import { Dimensions, TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const SCREEN_WIDTH = Dimensions.get('screen').width;

export default EStyleSheet.create({
  modalStyle: {
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 8,
  },

  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    zIndex: 999,
  },

  sheetIndicator: {
    backgroundColor: '$iconColor',
  },

  contentContainer: {
    paddingBottom: 40,
  },
  imageContainer: {
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  selectedThumbContainer: {
    flexDirection: 'row',
  },
  thumbSeparator: {
    width: 6,
    marginTop: 12,
    marginRight: 12,
    flex: 1,
    borderRadius: 8,
    backgroundColor: '$iconColor',
  },
  thumbnail: {
    marginTop: 10,
    width: 128,
    height: 72,
    resizeMode: 'cover',
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '$primaryLightBackground',
  },
  label: {
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: 'bold',
    flexGrow: 1,
    textAlign: 'left',
  },
  titleBox: {
    marginBottom: 20,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    width: '80%',
    marginTop: 10,
    color: '$primaryDarkGray',
  },
  actionPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  } as ViewStyle,
  btnTxtClose: {
    color: '$iconColor',
    fontSize: 16,
  } as TextStyle,
  btnClose: {
    marginRight: 12,
  } as ViewStyle,
  uploadButton: {
    marginBottom: 24,
    paddingHorizontal: 16,
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaPlayer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH / 1.77,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
});
