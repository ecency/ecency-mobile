import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';
import { PortfolioItem } from 'providers/ecency/ecency.types';
import styles from '../styles/tokensSelectModa.styles';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { CheckBox, Icon, MainButton, SearchInput } from '../../../components';
import { AssetBase, ProfileToken, TokenType } from '../../../redux/reducers/walletReducer';
import DEFAULT_ASSETS from '../../../constants/defaultAssets';
import { setSelectedAssets } from '../../../redux/actions/walletActions';
import { AssetIcon } from '../../../components/atoms';
import { useUpdateProfileTokensMutation } from '../../../providers/queries/walletQueries/walletQueries';
import { walletQueries } from '../../../providers/queries';

/**
 *  NOTE: using AssetsSelectModal as part of native-stack with modal presentation is important
 *  as GestureResponder do not work as expected when used inside regular Modal on android
 *  */
type SelectableAsset = PortfolioItem & {
  isEngine?: boolean;
  isSpk?: boolean;
  isChain?: boolean;
  isSectionSeparator?: boolean;
};

const IconComponent = Icon as any;
const MainButtonComponent = MainButton as any;
const SearchInputComponent = SearchInput as any;

const mapAssetLayer = (asset: PortfolioItem | SelectableAsset): SelectableAsset => {
  if ((asset as SelectableAsset).isSectionSeparator) {
    return asset as SelectableAsset;
  }

  const base = asset as PortfolioItem;

  return {
    ...base,
    isEngine: (asset as SelectableAsset).isEngine ?? base.layer === 'engine',
    isSpk: (asset as SelectableAsset).isSpk ?? base.layer === 'spk',
    isChain: (asset as SelectableAsset).isChain ?? base.layer === 'chain',
  };
};

const AssetsSelect = ({ navigation }: { navigation: any }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const assetsQuery = walletQueries.useAssetsQuery();

  // const coinsData = useAppSelector((state) => state.wallet.coinsData);

  const selectedAssets: AssetBase[] = useAppSelector((state) => state.wallet.selectedAssets);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const selectionRef = useRef<AssetBase[]>([]);

  const updateProfileTokensMutation = useUpdateProfileTokensMutation();

  const [listData, setListData] = useState<SelectableAsset[]>([]);
  const [sortedList, setSortedList] = useState<SelectableAsset[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    selectionRef.current = selectedAssets.filter(
      (item) =>
        (item.isEngine || item.isSpk || item.isChain) &&
        assetsQuery.selectedableData?.some((asset) => asset.symbol === item.symbol),
    );
    _updateSortedList();
  }, []);

  useEffect(() => {
    const data: SelectableAsset[] = [];
    assetsQuery.selectedableData?.forEach((asset) => {
      const _name = asset.name?.toLowerCase() || '';
      const _symbol = asset.symbol.toLowerCase();
      const _query = query.toLowerCase();

      const _isSelected =
        selectionRef.current.findIndex((item) => item.symbol === asset.symbol) > -1;

      if (query === '' || _isSelected || _symbol.includes(_query) || _name.includes(_query)) {
        data.push(mapAssetLayer(asset));
      }
    });

    setListData(data);
    _updateSortedList({ data });
  }, [query, assetsQuery.selectedableData]);

  const _updateSortedList = ({ data }: { data?: SelectableAsset[] } = { data: listData }) => {
    const source = data || listData;
    const _data = source.map(mapAssetLayer);
    _data.sort((a, b) => {
      const _getSortingIndex = (e: SelectableAsset) =>
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

    _data.splice(selectionRef.current.length, 0, {
      isSectionSeparator: true,
    } as SelectableAsset);

    setSortedList(_data);
  };

  const _updateUserProfile = async () => {
    // extract a list of tokens preserved tokens
    const fixedAssets = (currentAccount?.about?.profile?.tokens || []).filter(
      (item: ProfileToken) => item.type === TokenType.HIVE,
    );

    // get updated chain assets
    let chainAssets = (currentAccount?.about?.profile?.tokens || []).filter(
      (item: ProfileToken) => item.type === TokenType.CHAIN,
    );

    // construct profile tokens data from selectionRef
    const selectedAssets = selectionRef.current
      .filter((item) => item.isEngine || item.isSpk || item.isChain)
      .map((item) => {
        // remove matching chain asset from existing list and set show to true
        if (item.isChain) {
          const existingChainAsset = chainAssets.find(
            (asset: ProfileToken) => asset.symbol === item.symbol,
          );
          chainAssets = chainAssets.filter((asset: ProfileToken) => asset.symbol !== item.symbol);

          existingChainAsset.meta.show = true;
          return existingChainAsset;
        }

        return {
          symbol: item.symbol,
          type: item.isEngine ? TokenType.ENGINE : TokenType.SPK, // we knwo chain tokens have already been filtered.
          meta: {
            show: true,
          },
        };
      });

    const tokens = [...fixedAssets, ...selectedAssets, ...chainAssets];
    console.log('updating profile with tokens:', tokens);

    updateProfileTokensMutation.mutateAsync(tokens);
    _navigationGoBack();
  };

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  const _onApply = () => {
    dispatch(setSelectedAssets([...DEFAULT_ASSETS, ...selectionRef.current]));
    _updateUserProfile(); // update the user profile with updated tokens data
  };

  const _onDragEnd = ({
    data,
    from,
    to,
  }: {
    data: SelectableAsset[];
    from: number;
    to: number;
  }) => {
    const totalSel = selectionRef.current.length;
    const item = sortedList[from];
    const isEngine = item.isEngine ?? item.layer === 'engine';
    const isSpk = item.isSpk ?? item.layer === 'spk';
    const isChain = item.isChain ?? item.layer === 'chain';

    const _obj = {
      id: item.symbol,
      symbol: item.symbol,
      isEngine,
      isSpk,
      isChain,
      notCrypto: false,
    } as AssetBase;

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
    const _renderItem = ({ item, drag }: { item: SelectableAsset; drag: () => void }) => {
      if (item.isSectionSeparator) {
        return _renderSectionSeparator(intl.formatMessage({ id: 'wallet.available_assets' }));
      }

      const key = item.symbol;
      const index = selectionRef.current.findIndex((selected) => selected.symbol === item.symbol);
      const isSelected = index >= 0;

      const isEngine = item.isEngine ?? item.layer === 'engine';
      const isSpk = item.isSpk ?? item.layer === 'spk';
      const isChain = item.isChain ?? item.layer === 'chain';

      const _onPress = () => {
        if (isSelected) {
          selectionRef.current.splice(index, 1);
        } else {
          selectionRef.current.push({
            id: key,
            symbol: key,
            isEngine,
            isSpk,
            isChain,
            notCrypto: false,
          });
        }

        _updateSortedList();
      };

      const _onCheckToggle = (_val: string, _checked: boolean) => {
        _onPress();
      };

      return (
        <ScaleDecorator>
          <View style={styles.checkView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckBox value={key} clicked={_onCheckToggle} isChecked={isSelected} />
              <AssetIcon
                id={item.symbol}
                containerStyle={styles.assetIconContainer}
                iconUrl={item.iconUrl}
                isEngine={isEngine}
                isSpk={isSpk}
                isChain={isChain}
                iconSize={24}
              />
              <Text style={styles.informationText}>{key}</Text>
            </View>
            <TouchableWithoutFeedback onPressIn={drag} style={styles.dragBtnContainer}>
              <IconComponent
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
        contentContainerStyle={styles.scrollContentContainer}
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
          <MainButtonComponent
            text={intl.formatMessage({ id: 'alert.confirm' })}
            onPress={_onApply}
            textStyle={styles.btnText}
            style={styles.button}
            isLoading={updateProfileTokensMutation.isPending}
          />
        </View>
      </View>
    );
  };

  // for modals, iOS has its own top safe area handling
  const _safeAreaEdges: Edges = Platform.select({ ios: [], default: ['top'] });

  return (
    <SafeAreaView style={styles.modalStyle} edges={_safeAreaEdges}>
      <SearchInputComponent
        showClearButton={true}
        placeholder={intl.formatMessage({ id: 'header.search' })}
        onChangeText={setQuery}
        value={query}
        backEnabled={true}
        autoFocus={false}
        onBackPress={_navigationGoBack}
      />
      {_renderContent()}
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(AssetsSelect);
