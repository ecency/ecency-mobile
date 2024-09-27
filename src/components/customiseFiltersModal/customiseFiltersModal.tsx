import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { KeyboardAvoidingView, Platform, View, Text } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useDispatch } from 'react-redux';
import { MainButton, SelectionList } from '..';
import { getDefaultFilters, getFilterMap } from '../../constants/options/filters';
import { useAppSelector } from '../../hooks';
import {
  setCommunityTabs,
  setMainTabs,
  setOwnProfileTabs,
  setProfileTabs,
} from '../../redux/actions/customTabsAction';
import styles from './customiseFiltersModalStyles';

export interface CustomiseFiltersModalRef {
  show: () => void;
}

interface Props {
  pageType: 'main' | 'community' | 'profile' | 'ownProfile';
}

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
  const [selectedFilters, setSelectedFilters] = useState<string[]>([...savedFilters]);

  /**
   * HANDLERS FUNCTIONS
   */

  useImperativeHandle(ref, () => ({
    show: () => {
      sheetModalRef.current?.show();
    },
  }));

  // actions
  const _onClose = () => {
    sheetModalRef.current?.hide();
  };

  // save snippet based on editor pageType
  const _onApply = () => {
    if (selectedFilters.length < 3) {
      alert(intl.formatMessage({ id: 'alert.wrong_filter_count' }));
      return;
    }

    const filters = [...selectedFilters];

    switch (pageType) {
      case 'main':
        dispatch(setMainTabs(filters));
        break;
      case 'community':
        dispatch(setCommunityTabs(filters));
        break;
      case 'profile':
        dispatch(setProfileTabs(filters));
        break;
      case 'ownProfile':
        dispatch(setOwnProfileTabs(filters));
        break;
    }
    _onClose();
  };

  /**
   * UI RENDERERS
   */

  const _renderOptions = () => {
    return (
      <View style={{ maxHeight: 500 }}>
        <SelectionList
          data={Object.entries(filterMap).map(([key, labelId]) => ({
            id: key,
            label: intl.formatMessage({ id: labelId }),
          }))}
          initSelectedIds={savedFilters}
          onSelectionChange={setSelectedFilters}
          headerPostfix={intl.formatMessage({ id: 'selection_list.postfix_filters' })}
        />
      </View>
    );
  };

  const _renderContent = (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={Platform.OS == 'ios' ? 64 : null}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <Text style={styles.title}>{intl.formatMessage({ id: 'selection_list.title_filters' })}</Text>

      {_renderOptions()}

      <View style={styles.actionPanel}>
        <MainButton
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
