import { createTheme } from 'react-native-theming';

const fonts = {
    FONT_SIZE_SMALL: '12',
    FONT_SIZE_MEDIUM: '14',
    FONT_SIZE_LARGE: '16',
    FONT_WEIGHT_LIGHT: '200',
    FONT_WEIGHT_MEDIUM: '600',
    FONT_WEIGHT_HEAVY: '800',
};

const themes = [
    createTheme(
        {
            backgroundColor: 'white',
            textColor: 'black',
            buttonColor: 'blue',
            buttonText: 'white',
            statusBar: 'dark-content',
            fontSize: fonts.FONT_SIZE_MEDIUM,
            fontWeight: fonts.FONT_WEIGHT_MEDIUM,
        },
        'Light'
    ),
    createTheme(
        {
            backgroundColor: 'black',
            textColor: 'white',
            buttonColor: 'yellow',
            buttonText: 'black',
            statusBar: 'light-content',
            fontSize: fonts.FONT_SIZE_MEDIUM,
            fontWeight: fonts.FONT_WEIGHT_MEDIUM,
        },
        'Dark'
    ),
];
