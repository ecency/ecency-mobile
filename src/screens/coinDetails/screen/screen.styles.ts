import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '$primaryBackgroundColor',
  },
  list:{
    flex:1,
  },
  listContent:{
    paddingBottom:56,
    marginHorizontal:16
  },
  textActivities:{
    color:'$primaryBlack',
    fontWeight:'600',
    fontSize:18,
    paddingVertical:16 
  }
});
