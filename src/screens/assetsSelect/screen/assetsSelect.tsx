import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useIntl } from 'react-intl';
import { get, isArray } from 'lodash';
import EStyleSheet from 'react-native-extended-stylesheet';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import styles from '../styles/tokensSelectModa.styles';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CheckBox, Icon, MainButton, SearchInput } from '../../../components';
import { AssetBase, CoinData } from '../../../redux/reducers/walletReducer';
import DEFAULT_ASSETS from '../../../constants/defaultAssets';
import { setSelectedCoins } from '../../../redux/actions/walletActions';
import { AssetIcon } from '../../../components/atoms';
import { profileUpdate } from '../../../providers/hive/dhive';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';

enum TokenType {
  ENGINE = 'ENGINE',
  SPK = 'SPK',
}

interface ProfileToken {
  symbol: string;
  type: TokenType;
}

/**
 *  NOTE: using AssetsSelectModal as part of native-stack with modal presentation is important
 *  as GestureResponder do not work as expected when used inside regular Modal on android
 *  */
const AssetsSelect = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const coinsData = useAppSelector((state) => state.wallet.coinsData);
  const selectedCoins: AssetBase[] = useAppSelector((state) => state.wallet.selectedCoins);
  const pinCode = useAppSelector((state) => state.application.pin);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const selectionRef = useRef<AssetBase[]>([]);

  const [listData, setListData] = useState<CoinData[]>([]);
  const [sortedList, setSortedList] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    selectionRef.current = selectedCoins.filter(
      (item) => (item.isEngine || item.isSpk) && !!coinsData[item.symbol],
    );
    _updateSortedList();
  }, []);

  useEffect(() => {
    const data: CoinData[] = [];

    Object.keys(coinsData).forEach((key) => {
      if (coinsData[key].isEngine || coinsData[key].isSpk) {
        const asset: CoinData = coinsData[key];
        const _name = asset.name.toLowerCase();
        const _symbol = asset.symbol.toLowerCase();
        const _query = query.toLowerCase();

        const _isSelected =
          selectionRef.current.findIndex((item) => item.symbol === asset.symbol) > -1;

        if (query === '' || _isSelected || _symbol.includes(_query) || _name.includes(_query)) {
          data.push(asset);
        }
      }
    });

    setListData(data);
    _updateSortedList({ data });
  }, [query, coinsData]);

  const _updateSortedList = ({ data } = { data: listData }) => {
    const _data = [...data];
    _data.sort((a, b) => {
      const _getSortingIndex = (e) =>
        selectionRef.current.findIndex((item) => item.symbol === e.symbol);
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

  // migration snippet
  useEffect(() => {
    const tokens = currentAccount?.about?.profile?.tokens;
    if (!tokens) {
      _updateUserProfile();
    } else if (!isArray(tokens)) {
      // means tokens is using old object formation, covert to array
      const _mapSymbolsToProfileToken = (symbols, type) =>
        isArray(symbols)
          ? symbols.map((symbol) => ({
              symbol,
              type,
            }))
          : [];

      _updateUserProfile([
        ..._mapSymbolsToProfileToken(tokens.engine, TokenType.ENGINE),
        ..._mapSymbolsToProfileToken(tokens.spk, TokenType.SPK),
      ]);
    }
  }, [currentAccount]);

  const _updateUserProfile = async (assetsData?: ProfileToken[]) => {
    try {
      if (!assetsData?.length) {
        assetsData = selectionRef.current.map((item) => ({
          symbol: item.symbol,
          type: item.isEngine ? TokenType.ENGINE : TokenType.SPK,
        }));
      }

      const updatedCurrentAccountData = currentAccount;
      updatedCurrentAccountData.about.profile = {
        ...updatedCurrentAccountData.about.profile,
        tokens: assetsData,
      };
      const params = {
        ...updatedCurrentAccountData.about.profile,
      };
      await profileUpdate(params, pinCode, currentAccount);
      dispatch(updateCurrentAccount(updatedCurrentAccountData));
    } catch (err) {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        get(err, 'message', err.toString()),
      );
    }
  };

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  const _onApply = () => {
    dispatch(setSelectedCoins([...DEFAULT_ASSETS, ...selectionRef.current]));
    _updateUserProfile(); // update the user profile with updated tokens data
    _navigationGoBack();
  };

  const _onDragEnd = ({ data, from, to }) => {
    const totalSel = selectionRef.current.length;
    const item = sortedList[from];

    const _obj = {
      id: item.symbol,
      symbol: item.symbol,
      isEngine: item.isEngine || false,
      isSpk: item.isSpk || false,
      notCrypto: false,
    };

    console.log('change order', item.symbol, from, to, 'total:', totalSel);

    if (from >= totalSel && to <= totalSel) {
      // insert in set at to
      selectionRef.current.splice(to, 0, _obj);
    } else if (from < totalSel && to >= totalSel) {
      // remove from sel
      selectionRef.current.splice(from, 1);
    } else if (from < totalSel && to < totalSel) {
      // order change from to
      selectionRef.current.splice(from, 1);
      selectionRef.current.splice(to, 0, _obj);
    }

    setSortedList(data);
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
      intl.formatMessage({ id: 'wallet.selected_assets' }),
      selectionRef.current.length ? '' : intl.formatMessage({ id: 'wallet.no_selected_assets' }),
    );

  const _renderOptions = () => {
    const _renderItem = ({ item, drag }) => {
      if (item.isSectionSeparator) {
        return _renderSectionSeparator(intl.formatMessage({ id: 'wallet.available_assets' }));
      }

      const key = item.symbol;
      const index = selectionRef.current.findIndex((selected) => selected.symbol === item.symbol);
      const isSelected = index >= 0;

      const _onPress = () => {
        if (isSelected) {
          selectionRef.current.splice(index, 1);
        } else {
          selectionRef.current.push({
            id: key,
            symbol: key,
            isEngine: item.isEngine || false,
            isSpk: item.isSpk || false,
            notCrypto: false,
          });
        }

        _updateSortedList();
      };

      return (
        <ScaleDecorator>
          <View style={styles.checkView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckBox clicked={_onPress} isChecked={isSelected} />
              <AssetIcon
                id={item.symbol}
                containerStyle={styles.assetIconContainer}
                iconUrl={item.iconUrl}
                isEngine={item.isEngine}
                isSpk={item.isSpk}
                iconSize={24}
              />
              <Text style={styles.informationText}>{key}</Text>
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
        extraData={query}
        renderItem={_renderItem}
        onDragEnd={_onDragEnd}
        ListHeaderComponent={_renderHeader}
        keyExtractor={(item, index) => `token_${item.symbol + index}`}
      />
    );
  };

  const _renderContent = () => {
    return (
      <View style={styles.modalContainer}>
        {_renderOptions()}

        <View style={styles.actionPanel}>
          <MainButton
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
    <View style={styles.modalStyle}>
      <SearchInput
        showClearButton={true}
        placeholder={intl.formatMessage({ id: 'header.search' })}
        onChangeText={setQuery}
        value={query}
        backEnabled={true}
        autoFocus={false}
        onBackPress={_navigationGoBack}
      />
      {_renderContent()}
    </View>
  );
};

export default gestureHandlerRootHOC(AssetsSelect);
