import React from 'react';
import { DimensionValue, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../icon';

interface Props {
  width: DimensionValue;
  height: DimensionValue;
  // Compact variant drops the label, for tight spots like grid cells.
  compact?: boolean;
  onPress: () => void;
}

/**
 * Stand-in for a content image while the "Show Images" setting is off.
 * Reserves the image's layout box and loads the real image only on tap,
 * so nothing is fetched until the user asks for it.
 */
export const HiddenImagePlaceholder = ({ width, height, compact, onPress }: Props) => {
  const intl = useIntl();

  // Very short boxes cannot fit the icon and label without clipping.
  const _compact = compact || (typeof height === 'number' && height < 72);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, { width, height }]}
      accessibilityRole="button"
      accessibilityLabel={intl.formatMessage({ id: 'post.tap_to_load_image' })}
    >
      <Icon
        iconType="MaterialCommunityIcons"
        name="image-outline"
        size={_compact ? 20 : 28}
        color={EStyleSheet.value('$iconColor')}
      />
      {!_compact && (
        <Text style={styles.label}>{intl.formatMessage({ id: 'post.tap_to_load_image' })}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '$primaryLightBackground',
    borderWidth: 1,
    borderColor: '$borderTopColor',
    borderStyle: 'dashed',
  },
  label: {
    marginTop: 6,
    color: '$iconColor',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default HiddenImagePlaceholder;
