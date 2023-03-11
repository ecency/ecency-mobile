import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useIntl } from 'react-intl';
import { get, isArray } from 'lodash';
import styles from '../styles/tokensSelectModa.styles';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CheckBox, Modal, SearchInput, TextButton } from '../../../components';
import { CoinBase, CoinData } from '../../../redux/reducers/walletReducer';
import DEFAULT_ASSETS from '../../../constants/defaultAssets';
import { setSelectedCoins } from '../../../redux/actions/walletActions';
import { AssetIcon } from '../../../components/atoms';
import { profileUpdate } from '../../../providers/hive/dhive';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';

export const AssetsSelectModal = forwardRef(({ }, ref) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const coinsData = useAppSelector((state) => state.wallet.coinsData);
  const selectedCoins: CoinBase[] = useAppSelector((state) => state.wallet.selectedCoins);
  const pinCode = useAppSelector((state) => state.application.pin);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [visible, setVisible] = useState(false);
  const [selection, setSelection] = useState(selectedCoins.filter((item) => item.isEngine));
  const [listData, setListData] = useState<CoinData[]>([]);
  const [query, setQuery] = useState('');

  const sortedList = useMemo(() => {
    return listData.sort((a, b) => {
      const _isSelected = (e) => selection.findIndex((item) => item.symbol === e.symbol) >= 0;
      const aSelected = _isSelected(a);
      const bSelected = _isSelected(b);
      return aSelected && bSelected ? 0 : aSelected ? -1 : 1; // makes sure items are sorted in order for selection
    });
  }, [listData, selection]);

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setVisible(true);
      setQuery('');
      setSelection(selectedCoins.filter((item) => item.isEngine));
    },
  }));



  // migration snippet
  useEffect(() => {
    if (!isArray(currentAccount?.about?.profile?.tokens)) {
      _updateUserProfile();
    }
  }, [currentAccount]);



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


  const _updateUserProfile = async () => {
    try {
      const assetsData = selection.map((item) => (({ 
        symbol: item.symbol, 
        type: 'ENGINE' 
      }))); //TODO: later handle SPK assets as well

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

  const _onApply = () => {
    dispatch(setSelectedCoins([...DEFAULT_ASSETS, ...selection]));
    setVisible(false);
    _updateUserProfile(); // update the user profile with updated tokens data
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
                id={item.symbol}
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
        data={sortedList}
        extraData={query}
        renderItem={_renderItem}
        keyExtractor={(item, index) => `token_${item.symbol + index}`}
      />
    );
  };

  const _renderContent = () => {
    return (
      <View style={styles.modalContainer}>
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
    <Modal
      isOpen={visible}
      handleOnModalClose={() => setVisible(false)}
      isFullScreen
      isCloseButton
      presentationStyle="formSheet"
      title={intl.formatMessage({ id: 'wallet.engine_select_assets' })}
      animationType="slide"
      style={styles.modalStyle}
    >
      {_renderContent()}
    </Modal>
  );
});
