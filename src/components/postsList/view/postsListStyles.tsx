import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  flatlistFooter: {
    alignContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 60,
    borderColor: '$borderColor',
  },
  placeholderWrapper: {
    flex: 1,
  },
  separator:{
    backgroundColor:'$primaryLightBackground', 
    marginBottom:8
  }
});
