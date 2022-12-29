import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useIntl } from 'react-intl';
import styles from '../styles/tokensSelectModa.styles';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CheckBox, SearchInput, TextButton } from '../../../components';
import { CoinBase, CoinData } from '../../../redux/reducers/walletReducer';
import DEFAULT_ASSETS from '../../../constants/defaultAssets';
import { setSelectedCoins } from '../../../redux/actions/walletActions';
import { AssetIcon } from '../../../components/atoms';

export const TokensSelectModal = forwardRef(({}, ref) => {
  const sheetModalRef = useRef<ActionSheet>();
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const coinsData = useAppSelector((state) => state.wallet.coinsData);
  const selectedCoins: CoinBase[] = useAppSelector((state) => state.wallet.selectedCoins);

  const [selection, setSelection] = useState(selectedCoins.filter((item) => item.isEngine));
  const [listData, setListData] = useState([]);
  const [query, setQuery] = useState('');

  useImperativeHandle(ref, () => ({
    showModal: () => {
      if (sheetModalRef.current) {
        sheetModalRef.current?.show();
        setQuery('');
      }
    },
  }));

  useEffect(() => {
    const data: CoinData[] = [];

    for (const key in coinsData) {
      if (coinsData.hasOwnProperty(key) && coinsData[key].isEngine) {
        const asset: CoinData = coinsData[key];
        const _name = asset.name.toLowerCase();
        const _symbol = asset.symbol.toLowerCase();
        const _query = query.toLowerCase();
        if (query === '' || _symbol.includes(_query) || _name.includes(_query)) {
          data.push(asset);
        }
      }
    }

    setListData(data);
  }, [query, coinsData]);

  const _onApply = () => {
    dispatch(setSelectedCoins([...DEFAULT_ASSETS, ...selection]));
    if (sheetModalRef.current) {
      sheetModalRef.current.hide();
    }
  };

  const _renderOptions = () => {
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AssetIcon
                containerStyle={styles.assetIconContainer}
                iconUrl={item.iconUrl}
                isEngine={item.isEngine}
                iconSize={24}
              />
              <Text style={styles.informationText}>{key}</Text>
            </View>
            <CheckBox locked isChecked={isSelected} />
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <FlatList
        style={styles.scrollContainer}
        data={listData}
        extraData={query}
        renderItem={_renderItem}
        keyExtractor={(item, index) => `token_${item.symbol + index}`}
      />
    );
  };

  const _renderContent = () => {
    return (
      <View style={styles.modalContainer}>
        <Text style={styles.title}>
          {intl.formatMessage({ id: 'wallet.engine_select_assets' })}
        </Text>
        <SearchInput
          onChangeText={setQuery}
          placeholder={intl.formatMessage({ id: 'header.search' })}
          autoFocus={false}
          backEnabled={false}
        />

        {_renderOptions()}

        <View style={styles.actionPanel}>
          <TextButton
            text={intl.formatMessage({ id: 'alert.confirm' })}
            onPress={_onApply}
            textStyle={styles.btnText}
            style={styles.button}
          />
        </View>
      </View>
    );
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
