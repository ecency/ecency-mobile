import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  icon: {
    color: '$iconColor',
    marginRight: 2.7,
    fontSize: 25,
  },
  sheetContent: {
    backgroundColor: '$modalBackground',
  },
  dropdownItem:{
    paddingHorizontal:32, 
    paddingVertical:12, 
    fontSize:14, 
    fontWeight:'600',
    color:'$primaryDarkText'
  },
  listContainer:{
    paddingTop:16,
    paddingBottom:40
  }
});
