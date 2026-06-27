import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wavy dash (〰️) glyph used as the Waves bottom-tab icon. Single Twemoji path,
 * tinted via `color` so it follows the active/inactive tab tint like the other
 * (vector-font) tab icons.
 *
 * The layout `style` (the tab bar's shared paddingTop offset) is applied to a
 * wrapping View, not the <Svg>: react-native-svg does not honor padding the way
 * the vector-icon <Text> glyphs do, so applying it to <Svg> left the icon ~15px
 * too high. The wrapper sizes to the SVG and inherits the same top offset, and
 * the parent tab cell centers it horizontally — keeping the Waves icon aligned
 * with the other icons across phones and tablets on both iOS and Android.
 */
const WavyDashIcon = ({ color = '#000000', size = 26, style }: Props) => (
  <View style={style}>
    <Svg width={size} height={size} viewBox="0 0 36 36">
      <Path
        fill={color}
        d="M27 23c-2.589 0-4.005-2.549-5.374-5.014C20.537 16.026 19.411 14 18 14c-1.412 0-2.537 2.026-3.626 3.986C13.004 20.451 11.588 23 9 23c-2.65 0-3.853-2.706-4.914-5.094C3.038 15.546 2.256 14 1 14a1 1 0 0 1 0-2c2.65 0 3.853 2.706 4.914 5.094C6.962 19.453 7.744 21 9 21c1.412 0 2.537-2.026 3.626-3.986C13.996 14.549 15.412 12 18 12c2.589 0 4.005 2.549 5.374 5.014C24.463 18.974 25.589 21 27 21c1.256 0 2.037-1.547 3.086-3.906C31.147 14.706 32.351 12 35 12a1 1 0 1 1 0 2c-1.256 0-2.037 1.546-3.086 3.906C30.853 20.294 29.649 23 27 23z"
      />
    </Svg>
  </View>
);

export default WavyDashIcon;
