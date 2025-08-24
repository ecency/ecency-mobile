import React from 'react';
import { useIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';
import get from 'lodash/get';

import styles from './horizontalIconListStyles';

import { IconButton, PopoverWrapper } from '..';

const HorizontalIconList = ({ options, optionsKeys }) => {
  const intl = useIntl();
  const _getTranslation = (id) => {
    let translation;

    try {
      translation = intl.formatMessage({ id });
    } catch (error) {
      translation = '';
    }

    return translation;
  };
  const _renderItem = ({ item }) => (
    <PopoverWrapper text={_getTranslation(get(options[get(item, 'type')], 'descriptionKey'))}>
      <View styles={styles.iconWrapper} key={get(item, 'type')}>
        <View style={styles.iconWrapper}>
          <IconButton
            iconStyle={styles.icon}
            style={styles.iconButton}
            iconType={get(options[get(item, 'type')], 'iconType')}
            name={get(options[get(item, 'type')], 'icon')}
            badgeCount={get(options[get(item, 'type')], 'point')}
            badgeStyle={styles.badge}
            badgeTextStyle={styles.badgeText}
            disabled
          />
        </View>
        <Text style={styles.subText}>
          {_getTranslation(get(options[get(item, 'type')], 'nameKey'))}
        </Text>
      </View>
    </PopoverWrapper>
  );

  return (
    <View style={styles.iconsWrapper}>
      <FlatList
        style={styles.iconsList}
        data={optionsKeys}
        keyExtractor={(item) => get(item, 'type', Math.random()).toString()}
        horizontal
        renderItem={_renderItem}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export { HorizontalIconList };
