import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    borderWidth: EStyleSheet.hairlineWidth,
    borderColor: '$iconColor',
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  thumbnailPlaceholder: {
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginVertical: 4,
    justifyContent: 'space-between',
  },
  linePlaceholder: {
    marginTop: 4,
  },
  firstLine: {
    marginTop: 0,
  },
});
