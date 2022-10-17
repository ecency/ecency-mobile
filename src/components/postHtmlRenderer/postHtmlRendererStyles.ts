import { ImageStyle, Platform, ViewStyle, TextStyle } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  baseStyle: {
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    fontSize: 16,
    marginBottom: 4,
  } as TextStyle,
  body: {
    color: '$primaryBlack',
  } as TextStyle,
  div: {
    width: '100%',
  },
  p: {
    marginTop: 6,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  } as TextStyle,
  h6: {
    fontSize: 14,
  } as TextStyle,
  pLi: {
    marginTop: 0,
    marginBottom: 0,
  } as TextStyle,
  a: {
    color: '$primaryBlue',
  } as TextStyle,
  img: {
    width: '100%',
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: 'red',
  } as ImageStyle,
  th: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    color: '$primaryBlack',
    backgroundColor: '$darkIconColor',
    fontSize: 14,
    padding: 10,
  } as TextStyle,
  tr: {
    flexDirection: 'row',
  } as ViewStyle,
  td: {
    flex: 1,
    borderWidth: 0.5,
    padding: 10,
    borderColor: '$tableBorderColor',
    backgroundColor: '$tableTrColor',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  table: {
    width: '100%',
  } as ViewStyle,
  li: {
    marginBottom: 12,
  } as ViewStyle,
  blockquote: {
    borderLeftWidth: 5,
    borderStyle: 'solid',
    marginLeft: 5,
    paddingLeft: 5,
    borderColor: '$darkIconColor',
  } as ViewStyle,
  code: {
    backgroundColor: '$darkIconColor',
    fontFamily: '$editorFont',
  } as TextStyle,
  textCenter: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  } as TextStyle,
  phishy: {
    color: '$primaryRed',
  } as TextStyle,
  textJustify: {
    textAlign: Platform.select({ ios: 'justify', android: 'auto' }), //justify with selectable on android causes ends of text getting clipped,
    letterSpacing: 0,
  } as TextStyle,
  revealButton: {
    backgroundColor: '$iconColor',
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    minWidth: 40,
    maxWidth: 170,
  },
  revealText: {
    color: '$white',
    fontSize: 14,
  },
  videoThumb: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$darkIconColor',
  },
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '$primaryBlack',
  } as ViewStyle,
});
