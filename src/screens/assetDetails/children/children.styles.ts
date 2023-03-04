import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export const CHART_NEGATIVE_MARGIN = 12;
export default EStyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '$primaryLightBackground',
  } as ViewStyle,
  iconContainer:{
    marginRight:8
  } as ViewStyle,
  basicsContainer: {
    alignItems: 'center',
    padding: 16,
  } as ViewStyle,
  coinTitleContainer: {
    flexDirection: 'row',
    alignItems:'center',
    marginTop:8
  } as ViewStyle,
  textCoinTitle: {
    color: '$primaryBlack',
    fontSize: 34,
    fontWeight: '700',
  } as TextStyle,
  textHeaderChange: {
    color: '$primaryDarkText',
    fontSize: 16,
    marginBottom: 32,
  } as TextStyle,

  textPositive: {
    color: '$primaryGreen',
  } as TextStyle,
  textNegative: {
    color: '$primaryRed',
  } as TextStyle,
  textBasicValue: {
    color: '$primaryBlack',
    fontWeight: '700',
    fontSize: 28,
  } as TextStyle,
  textBasicLabel: {
    color: '$primaryDarkText',
    fontSize: 14,
    marginBottom: 16,
  } as TextStyle,

  extraDataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 2,
  } as ViewStyle,

  textExtraValue: {
    color: '$primaryDarkText',
    fontWeight: '700',
    fontSize: 18,
  } as TextStyle,
  textExtraLabel: {
    color: '$primaryDarkText',
    fontSize: 14,
  } as TextStyle,

  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 32,
  } as ViewStyle,

  rangeOptionWrapper: {
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 24,
  } as ViewStyle,

  textRange: {
    fontSize: 16,
  } as TextStyle,

  chartContainer: {
    height: 168,
    marginTop: 16,
    marginLeft: -CHART_NEGATIVE_MARGIN,
    overflow: 'hidden',
  } as ViewStyle,
  list: {
    flex: 1,
  } as ViewStyle,
  listContent: {
    paddingBottom: 56,
    paddingHorizontal: 16,
  } as ViewStyle,

  //COIN ACTIONS STYLES
  actionBtnContainer: {
    
  } as ViewStyle,
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  } as ViewStyle,
  actionContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '$primaryLightBackground',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  } as ViewStyle,
  actionText: {
    color: '$primaryBlack',
  } as TextStyle,

  textActivities: {
    color: '$primaryBlack',
    fontWeight: '600',
    fontSize: 18,
    paddingVertical: 16,
    backgroundColor: '$primaryBackgroundColor',
    textAlign: 'left',
  } as TextStyle,

  activitiesFooterIndicator: {
    marginVertical: 16,
  } as ViewStyle,

  delegationsModal: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 16,
  },
  textUnderline: {
    textDecorationLine: 'underline',
    textDecorationColor: '$primaryDarkText',
  },
});
