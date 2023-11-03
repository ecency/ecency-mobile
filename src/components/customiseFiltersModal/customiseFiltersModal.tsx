import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { TouchableOpacity, KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useDispatch } from 'react-redux';
import { CheckBox } from '..';
import { getDefaultFilters, getFilterMap } from '../../constants/options/filters';
import { useAppSelector } from '../../hooks';
import {
  setCommunityTabs,
  setMainTabs,
  setOwnProfileTabs,
  setProfileTabs,
} from '../../redux/actions/customTabsAction';
import { TextButton } from '../buttons';
import styles from './customiseFiltersModalStyles';

export interface CustomiseFiltersModalRef {
  show: () => void;
}

interface Props {
  pageType: 'main' | 'community' | 'profile' | 'ownProfile';
}

const getFilterIndex = (filterMap: any, key: string) => Object.keys(filterMap).indexOf(key);

const CustomiseFiltersModal = ({ pageType }: Props, ref: Ref<CustomiseFiltersModalRef>) => {
  if (!pageType) {
    throw new Error('pageType must not be empty');
  }

  const dispatch = useDispatch();
  const intl = useIntl();

  const sheetModalRef = useRef<ActionSheet>();

  // redux
  const savedFilters = useAppSelector((state) => {
    const defaultFilters = getDefaultFilters(pageType);
    switch (pageType) {
      case 'community':
        return state.customTabs.communityTabs || defaultFilters;
      case 'main':
        return state.customTabs.mainTabs || defaultFilters;
      case 'profile':
        return state.customTabs.profileTabs || defaultFilters;
      case 'ownProfile':
        return state.customTabs.ownProfileTabs || defaultFilters;
      default:
        return state.customTabs.mainTabs || defaultFilters;
    }
  });

  // state
  const [filterMap] = useState(getFilterMap(pageType));
  const [selectedFilters, setSelectedFilters] = useState<Map<string, number>>(
    new Map(savedFilters.map((key: string) => [key, getFilterIndex(filterMap, key)])),
  );

  /**
   * HANDLERS FUNCTIONS
   */

  useImperativeHandle(ref, () => ({
    show: () => {
      sheetModalRef.current?.setModalVisible(true);
    },
  }));

  // actions
  const _onClose = () => {
    sheetModalRef.current?.setModalVisible(false);
  };

  // save snippet based on editor pageType
  const _onApply = () => {
    if (selectedFilters.size !== 3) {
      alert(intl.formatMessage({ id: 'alert.wrong_filter_count' }));
      return;
    }
    const entries = Array.from(selectedFilters.entries())
      .sort((a, b) => (a[1] < b[1] ? -1 : 1))
      .map((e) => e[0]);

    switch (pageType) {
      case 'main':
        dispatch(setMainTabs(entries));
        break;
      case 'community':
        dispatch(setCommunityTabs(entries));
        break;
      case 'profile':
        dispatch(setProfileTabs(entries));
        break;
      case 'ownProfile':
        dispatch(setOwnProfileTabs(entries));
        break;
    }
    _onClose();
  };

  /**
   * UI RENDERERS
   */

  const _renderOptions = () => {
    const options = [];
    Object.keys(filterMap).forEach((key) => {
      const isSelected = selectedFilters.has(key);

      const _onPress = () => {
        if (isSelected) {
          selectedFilters.delete(key);
        } else {
          const index = getFilterIndex(filterMap, key);
          selectedFilters.set(key, index);
        }
        setSelectedFilters(new Map([...selectedFilters]));
      };

      options.push(
        <TouchableOpacity key={key} onPress={_onPress}>
          <View style={styles.checkView}>
            <Text style={styles.informationText}>
              {intl.formatMessage({
                id: filterMap[key],
              })}
            </Text>
            <CheckBox locked isChecked={isSelected} />
          </View>
        </TouchableOpacity>,
      );
    });

    return <View style={styles.textContainer}>{options}</View>;
  };

  const _renderContent = (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.OS == 'ios' ? 64 : null}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <Text style={styles.title}>Customise Filters</Text>

      {_renderOptions()}

      <View style={styles.actionPanel}>
        <TextButton
          text="APPLY"
          onPress={_onApply}
          textStyle={styles.btnText}
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <ActionSheet
      ref={sheetModalRef}
      containerStyle={styles.sheetContent}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
      onClose={_onClose}
    >
      {_renderContent}
    </ActionSheet>
  );
};

export default forwardRef(CustomiseFiltersModal);
