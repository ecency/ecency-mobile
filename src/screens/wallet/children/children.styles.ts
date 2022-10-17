import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ImageStyle } from 'react-native-fast-image';
import { isRTL } from '../../../utils/I18nUtils';

export default EStyleSheet.create({
  cardContainer: {
    backgroundColor: '$primaryLightBackground',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '$primaryLightBackground',
  } as ViewStyle,

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  } as ViewStyle,

  cardTitleContainer: {
    marginHorizontal: 8,
    flex: 1,
  } as ViewStyle,

  cardValuesContainer: {
    marginHorizontal: 8,

    justifyContent: 'flex-end',
  } as ViewStyle,

  claimContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  } as ViewStyle,

  claimBtn: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  } as ViewStyle,

  claimBtnTitle: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  } as TextStyle,

  claimIconWrapper: {
    backgroundColor: '$pureWhite',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 20,
    width: 24,
    height: 24,
  } as ViewStyle,

  logo: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: '$primaryBlue',
  } as ImageStyle,

  menuIcon: {
    color: '$primaryBlue',
    paddingLeft: 12,
  } as ViewStyle,

  header: {
    backgroundColor: '$primaryBackgroundColor',
  },
  dotStyle: {
    backgroundColor: '$darkGrayBackground',
  },
  chartContainer: {
    height: 112,
  },
  cardFooter: {
    position: 'absolute',
    bottom: 8,
    left: isRTL() ? 16 : 76,
    right: isRTL() ? 76 : 16,
    paddingTop: 8,
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    borderColor: '$chartText',
    borderTopWidth: EStyleSheet.hairlineWidth,
  } as ViewStyle,
  textDiffPositive: {
    fontSize: 18,
    color: '$primaryGreen',
    textAlign: 'left',
  } as TextStyle,
  textDiffNegative: {
    fontSize: 16,
    color: '$primaryRed',
    textAlign: 'left',
  } as TextStyle,
  textCurValue: {
    fontSize: 16,
    color: '$primaryBlack',
    fontWeight: '300',
    textAlign: 'left',
  } as TextStyle,
  textTitle: {
    fontSize: 16,
    color: '$primaryBlack',
    fontWeight: '500',
    textAlign: 'left',
  },
  textSubtitle: {
    fontSize: 14,
    color: '$primaryDarkText',
    fontWeight: '300',
    textAlign: 'left',
  } as TextStyle,
  textSubtitleRight: {
    fontSize: 14,
    color: '$primaryDarkText',
    fontWeight: '300',
    textAlign: 'right',
  } as TextStyle,
  claimActivityIndicator: {
    marginLeft: 16,
  } as ViewStyle,
});
