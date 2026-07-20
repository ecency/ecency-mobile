import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import Svg, { Path } from 'react-native-svg';

// A soft, recessed gray so the mark reads as a faint hint, not a status badge.
// Same values as the web badge (Tailwind gray-300 / gray-700): light on a light
// ground, dark on a dark ground, both a step quieter than $iconColor. Kept as
// literals because there is no matching theme token, mirroring the web classes.
const MARK_COLOR_LIGHT = '#d1d5db';
const MARK_COLOR_DARK = '#374151';

// The bare Ecency "e" mark, cropped tight to the glyph. Same path and viewBox
// as the web badge so both clients render an identical shape.
const MARK_PATH =
  'M88.27,105.71c-9,.08-30.35.27-35.13-.29-3.88-.46-11-3-11.11-12.81C42,87,41.66,64,42.46,59,44.13,48.4,47,41.77,59.05,36.33c10.26-4.44,32.17-.78,34.54,16.93.45,3.37,1.25,3.74,2.49,4,19.61,4.13,24,26.26,14.6,38.32C104.73,103.26,98.31,104.76,88.27,105.71ZM84.71,59.25c.68-11.52-11-19.82-22.82-13.66-8.42,4.39-9.15,10.76-9.68,18-.67,9.2-.25,15.91-.09,25.13.07,4.13,1.27,6.64,5.7,7,1.14.1,17,0,25.22.06,10.74.06,24.06-4.89,21.93-18a12.68,12.68,0,0,0-10.8-10.22,2.12,2.12,0,0,0-2.21,1C85,83,69.66,82.31,63.41,74.46c-5.61-7.06-2.7-18.73,4.68-21.2,2.78-.94,5.11-.11,6.25,1.86,1.84,3.18.11,6.06-2.49,7.65s-2.45,3.92-1.36,5.46c2.56,3.59,7.6,2.88,10.79-.28C83.87,65.4,84.52,62.47,84.71,59.25Z';

interface Props {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Marks content published from an Ecency client. Deliberately low-emphasis: the
 * bare mark in a soft gray rather than the blue round logo, which read as a
 * status badge and competed with the blue Pro checkmark sitting beside it. One
 * means "this account pays for Pro", the other only "posted from Ecency".
 */
export const EcencySourceBadge = ({ size = 12, color, style }: Props) => {
  const intl = useIntl();
  const isDark = EStyleSheet.value('$theme') === 'darkTheme';

  return (
    <Svg
      width={size}
      height={size}
      viewBox="40.6 28.7 80.4 80.4"
      style={style}
      accessibilityRole="image"
      accessibilityLabel={intl.formatMessage({
        id: 'post.source_ecency',
        defaultMessage: 'Published with Ecency',
      })}
    >
      <Path d={MARK_PATH} fill={color ?? (isDark ? MARK_COLOR_DARK : MARK_COLOR_LIGHT)} />
    </Svg>
  );
};

export default EcencySourceBadge;
