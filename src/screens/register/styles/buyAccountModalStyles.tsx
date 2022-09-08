import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getBottomSpace } from 'react-native-iphone-x-helper';

export default EStyleSheet.create({
    modalStyle: {
        backgroundColor: '$primaryBackgroundColor',
        margin:0,
        paddingTop:32,
        marginHorizontal:24,
        paddingBottom: getBottomSpace() + 8,
      },

    sheetContent: {
        backgroundColor: '$primaryBackgroundColor',
    },

    contentContainer: {
        justifyContent: 'space-around',
        backgroundColor: '$primaryBackgroundColor',
        flex: 1,
      },
      iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 24,
        backgroundColor: '$primaryBackgroundColor',
      },
      userContainer: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: '$primaryBackgroundColor',
        paddingVertical: 8,
        marginBottom: -16,
        paddingLeft: 32,
      },
      avatarStyle: {
        width: 72,
        height: 72,
        borderRadius: 66,
        borderColor: '$primaryBlue',
        borderWidth: 4,
      },
      usernameContainer: {
        zIndex: -1,
        paddingVertical: 8,
        paddingRight: 20,
        paddingLeft: 16,
        marginLeft: -8,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        backgroundColor: '$primaryBlue',
      },
      usernameText: {
        color: '$white',
        fontSize: 15,
        fontWeight: 'bold',
      },
      logoEstm: {
        width: '$deviceWidth / 1.4',
        height: '$deviceHeight / 3',
      },
      desc: {
        width: '$deviceWidth / 1.5',
        fontSize: 16,
        textAlign: 'center',
        color: '$primaryDarkGray',
      },
      productsWrapper: {
        paddingTop: 8,
        paddingBottom: 52,
        marginHorizontal: 16,
      },

});
