import { createTheme } from 'react-native-theming';

const themes = [
    createTheme(
        {
            backgroundColor: 'white',
            textColor: 'black',
            buttonColor: 'blue',
            buttonText: 'white',
            statusBar: 'dark-content',
            FONT_SIZE_SMALL: 12,
            FONT_SIZE_MEDIUM: 14,
            FONT_SIZE_LARGE: 16,
            FONT_WEIGHT_LIGHT: 200,
            FONT_WEIGHT_MEDIUM: '600',
            FONT_WEIGHT_HEAVY: '800',
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
            FONT_SIZE_SMALL: 12,
            FONT_SIZE_MEDIUM: 14,
            FONT_SIZE_LARGE: 16,
            FONT_WEIGHT_LIGHT: 200,
            FONT_WEIGHT_MEDIUM: '600',
            FONT_WEIGHT_HEAVY: '800',
        },
        'Dark'
    ),
];
