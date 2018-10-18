import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  textWrapper: {
    flex: 1,
    flexDirection: 'column',
    fontSize: 16,
  },
  inlinePadding: {
    padding: 8,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '$white',
  },
  // markdownStyles: {
  //   heading1: {
  //     fontSize: 24,
  //     color: 'purple',
  //   },
  //   link: {
  //     color: 'pink',
  //   },
  //   mailTo: {
  //     color: 'orange',
  //   },
  //   text: {
  //     color: '#555555',
  //   },
  // },
});
