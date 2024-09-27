import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import EStyleSheet from 'react-native-extended-stylesheet';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { CheckBox, Icon } from '../..';
import styles from '../styles/selectionList.styles';

export interface ListItem {
  id: string;
  label: string;
  iconElement?: any;
}

interface SelectionListProps {
  data: ListItem[];
  initSelectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  headerPostfix?: string;
}

export const SelectionList = ({
  data,
  initSelectedIds,
  headerPostfix,
  onSelectionChange,
}: SelectionListProps) => {
  const intl = useIntl();
  const selectionRef = useRef<string[]>(initSelectedIds);

  const [sortedList, setSortedList] = useState<ListItem[]>([]);

  useEffect(() => {
    _updateSortedList();
  }, [data]);

  const _updateSortedList = () => {
    const _data = [...data];
    _data.sort((a, b) => {
      const _getSortingIndex = (e: ListItem) =>
        selectionRef.current.findIndex((item) => item === e.id);
      const _aIndex = _getSortingIndex(a);
      const _bIndex = _getSortingIndex(b);

      if (_aIndex > -1 && _bIndex > -1) {
        return _aIndex - _bIndex;
      }
      if (_aIndex > -1 && _bIndex < 0) {
        return -1;
      } else if (_aIndex < 0 && _bIndex > -1) {
        return 1;
      }

      return 0;
    });

    _data.splice(selectionRef.current.length, 0, { isSectionSeparator: true });

    setSortedList(_data);
  };

  const _onDragEnd = ({ data, from, to }) => {
    const totalSel = selectionRef.current.length;
    const item = sortedList[from];

    // const _obj = {
    //   id: item.symbol,
    //   symbol: item.symbol,
    //   isEngine: item.isEngine || false,
    //   isSpk: item.isSpk || false,
    //   notCrypto: false,
    // };

    // console.log('change order', item.symbol, from, to, 'total:', totalSel);

    if (from >= totalSel && to <= totalSel) {
      // insert in set at to
      selectionRef.current.splice(to, 0, item.id);
    } else if (from < totalSel && to >= totalSel) {
      // remove from sel
      selectionRef.current.splice(from, 1);
    } else if (from < totalSel && to < totalSel) {
      // order change from to
      selectionRef.current.splice(from, 1);
      selectionRef.current.splice(to, 0, item.id);
    }

    setSortedList(data);
    onSelectionChange(selectionRef.current);
  };

  const _renderSectionSeparator = (text: string, subText?: string) => {
    return (
      <>
        <Text style={styles.sectionTextStyle}>{text}</Text>
        {!!subText && (
          <Animated.Text entering={ZoomIn} style={styles.sectionSubTextStyle}>
            {subText}
          </Animated.Text>
        )}
      </>
    );
  };

  const _renderHeader = () =>
    _renderSectionSeparator(
      intl.formatMessage({ id: 'selection_list.selected' }, { postfix: headerPostfix }),
      selectionRef.current.length ? '' : intl.formatMessage({ id: 'selection_list.no_selected' }),
    );

  const _renderItem = ({ item, drag }: { item: ListItem; drag: () => void }) => {
    if (item.isSectionSeparator) {
      return _renderSectionSeparator(
        intl.formatMessage({ id: 'selection_list.available' }, { postfix: headerPostfix }),
      );
    }

    // const key = item.symbol;
    const index = selectionRef.current.findIndex((selected) => selected === item.id);
    const isSelected = index >= 0;

    const _onPress = () => {
      if (isSelected) {
        selectionRef.current.splice(index, 1);
      } else {
        selectionRef.current.push(item.id);
        //     {
        //     id: key,
        //     symbol: key,
        //     isEngine: item.isEngine || false,
        //     isSpk: item.isSpk || false,
        //     notCrypto: false,
        // });
      }

      _updateSortedList();
      onSelectionChange(selectionRef.current);
    };

    return (
      <ScaleDecorator>
        <View style={styles.checkView}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CheckBox clicked={_onPress} isChecked={isSelected} />
            {item.iconElement && item.iconElement}
            {/* <AssetIcon
                            id={item.symbol}
                            containerStyle={styles.assetIconContainer}
                            iconUrl={item.iconUrl}
                            isEngine={item.isEngine}
                            isSpk={item.isSpk}
                            iconSize={24}
                        /> */}
            <Text style={styles.informationText}>{item.label}</Text>
          </View>
          <TouchableWithoutFeedback onPressIn={drag} style={styles.dragBtnContainer}>
            <Icon
              iconType="MaterialCommunityIcons"
              name="drag-horizontal-variant"
              color={EStyleSheet.value('$iconColor')}
              size={24}
            />
          </TouchableWithoutFeedback>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <DraggableFlatList
      containerStyle={styles.scrollContainer}
      data={sortedList}
      // extraData={query}
      renderItem={_renderItem}
      onDragEnd={_onDragEnd}
      ListHeaderComponent={_renderHeader}
      keyExtractor={(item, index) => `item_${item.id + index}`}
    />
    // <Text>There mus tbe list reddred</Text>
  );
};
