import React from 'react';
import { useIntl } from 'react-intl';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import { Popover, PopoverController } from 'react-native-modal-popover';
import get from 'lodash/get';

import styles from './horizontalIconListStyles';

import { IconButton } from '..';

const HorizontalIconList = ({ options, optionsKeys }) => {
  const intl = useIntl();
  const _getTranslation = id => {
    let translation;

    try {
      translation = intl.formatMessage({ id });
    } catch (error) {
      translation = '';
    }

    return translation;
  };

  return (
    <View style={styles.iconsWrapper}>
      <FlatList
        style={styles.iconsList}
        data={optionsKeys}
        keyExtractor={item => get(item, 'type', Math.random()).toString()}
        horizontal
        renderItem={({ item }) => (
          <PopoverController key={get(item, 'type')}>
            {({
              openPopover,
              closePopover,
              popoverVisible,
              setPopoverAnchor,
              popoverAnchorRect,
            }) => (
              <View styles={styles.iconWrapper} key={get(item, 'type')}>
                <View style={styles.iconWrapper}>
                  <TouchableOpacity ref={setPopoverAnchor} onPress={openPopover}>
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
                  </TouchableOpacity>
                </View>
                <Text style={styles.subText}>
                  {_getTranslation(get(options[get(item, 'type')], 'nameKey'))}
                </Text>
                <Popover
                  backgroundStyle={styles.overlay}
                  contentStyle={styles.popoverDetails}
                  arrowStyle={styles.arrow}
                  visible={popoverVisible}
                  onClose={() => closePopover()}
                  fromRect={popoverAnchorRect}
                  placement="top"
                  supportedOrientations={['portrait', 'landscape']}
                >
                  <View style={styles.popoverWrapper}>
                    <Text style={styles.popoverText}>
                      {_getTranslation(get(options[get(item, 'type')], 'descriptionKey'))}
                    </Text>
                  </View>
                </Popover>
              </View>
            )}
          </PopoverController>
        )}
      />
    </View>
  );
};

export { HorizontalIconList };
