import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  text: {
    fontSize: 12,
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
  },
  container: {
    paddingHorizontal: 0,
    marginTop: 10,
  },
  a: {
    color: '$primaryBlue',
    fontFamily: '$primaryFont',
  },
  h4: {
    fontSize: 15,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  h1: {
    fontSize: 30,
  },
  h2: {
    fontSize: 25,
  },
  h3: {
    fontSize: 20,
  },
  img: {
    // height: 50,
    marginTop: 10,
    // left: -15,
  },
  commentContainer: {
    paddingHorizontal: 0,
    marginTop: 10,
  },
  th: {
    flex: 1,
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '$primaryBlack',
    fontSize: 14,
    padding: 5,
  },
  tr: {
    backgroundColor: '$darkIconColor',
    flexDirection: 'row',
  },
  td: {
    borderWidth: 0.5,
    borderColor: '$tableBorderColor',
    flex: 1,
    padding: 10,
    backgroundColor: '$tableTrColor',
  },
  blockquote: {
    borderLeftWidth: 5,
    borderColor: '$darkIconColor',
    paddingLeft: 5,
  },
  code: {
    backgroundColor: '$darkIconColor',
    fontFamily: '$editorFont',
  },
});
