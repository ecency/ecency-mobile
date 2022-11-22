import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from '../styles/tokensSelectModa.styles';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CheckBox, TextButton } from '../../../components';
import { CoinBase } from '../../../redux/reducers/walletReducer';
import DEFAULT_COINS from '../../../constants/defaultCoins';
import { setSelectedCoins } from '../../../redux/actions/walletActions';
import { FlatList } from 'react-native-gesture-handler';

export const TokensSelectModal = forwardRef(({}, ref) => {
  const sheetModalRef = useRef<ActionSheet>();
  const dispatch = useAppDispatch();

  const coinsData = useAppSelector((state) => state.wallet.coinsData);
  const selectedCoins: CoinBase[] = useAppSelector((state) => state.wallet.selectedCoins);

  const [selection, setSelection] = useState(selectedCoins.filter((item) => item.isEngine));

  useImperativeHandle(ref, () => ({
    showModal: () => {
      if (sheetModalRef.current) {
        sheetModalRef.current?.show();
      }
    },
  }));

  const _onApply = () => {
    dispatch(setSelectedCoins([...DEFAULT_COINS, ...selection]));
    if (sheetModalRef.current) {
      sheetModalRef.current.hide();
    }
  };

  const _renderOptions = () => {
    const data = [];

    for (const key in coinsData) {
      if (coinsData.hasOwnProperty(key) && coinsData[key].isEngine) {
        data.push(coinsData[key]);
      }
    }

    const _renderItem = ({ item }) => {
      const key = item.symbol;
      const index = selection.findIndex((selected) => selected.symbol === item.symbol);
      const isSelected = index >= 0;

      const _onPress = () => {
        if (isSelected) {
          selection.splice(index, 1);
        } else {
          selection.push({
            id: key,
            symbol: key,
            isEngine: true,
            notCrypto: false,
          });
        }
        setSelection([...selection]);
      };
      return (
        <TouchableOpacity onPress={_onPress}>
          <View style={styles.checkView}>
            <Text style={styles.informationText}>{key}</Text>
            <CheckBox locked isChecked={isSelected} />
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <FlatList
        style={styles.scrollContainer}
        data={data}
        renderItem={_renderItem}
        keyExtractor={(item) => `token_${item.symbol}`}
      />
    );
  };

  const _renderContent = () => {
    return (
      <View style={styles.modalContainer}>
        <Text style={styles.title}>SELECT TOKENS</Text>

        {_renderOptions()}

        <View style={styles.actionPanel}>
          <TextButton
            text="APPLY"
            onPress={_onApply}
            textStyle={styles.btnText}
            style={styles.button}
          />
        </View>
      </View>
    )
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={false}
      containerStyle={styles.sheetContent}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    >
      {_renderContent()}
    </ActionSheet>
  );
});

