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
import { selectCurrentAccount } from '../../../redux/selectors';

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

  const assetsQuery = walletQueries.useAssetsQuery({ onlyEnabled: false });

  const currentAccount = useAppSelector(selectCurrentAccount);

  const selectionRef = useRef<AssetBase[]>([]);

  const updateProfileTokensMutation = useUpdateProfileTokensMutation();

  const [listData, setListData] = useState<SelectableAsset[]>([]);
  const [sortedList, setSortedList] = useState<SelectableAsset[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Initialize selectionRef from profile metadata
    // Read directly from profile metadata as source of truth
    const profileTokens = currentAccount?.profile?.tokens;

    if (Array.isArray(profileTokens)) {
      // Filter profile tokens to only include enabled ones (where meta.show is true or undefined)
      // HIVE tokens are excluded (they're always enabled by default and shouldn't be in metadata)
      const enabledTokens = profileTokens.filter(
        (token: ProfileToken) =>
          token.type !== TokenType.HIVE && (!token.meta || token.meta.show !== false),
      );

      // Convert to AssetBase format
      // Note: We don't filter against assetsQuery.selectedableData because:
      // - CHAIN tokens (BTC, ETH, etc.) may not be in the Hive portfolio query
      // - Profile metadata is the source of truth for what's selected
      const filtered = enabledTokens.map((token: ProfileToken) => ({
        id: token.symbol,
        symbol: token.symbol,
        isEngine: token.type === TokenType.ENGINE,
        isSpk: token.type === TokenType.SPK,
        isChain: token.type === TokenType.CHAIN,
        notCrypto: false,
      }));

      selectionRef.current = filtered;
    } else {
      // No profile tokens, initialize to empty
      selectionRef.current = [];
    }
    // Don't call _updateSortedList() here - Effect 2 will handle it
    // when it processes assetsQuery.selectedableData
  }, [currentAccount]);

  useEffect(() => {
    const data: SelectableAsset[] = [];
    const addedSymbols = new Set<string>();

    // Add tokens from assetsQuery (Hive tokens)
    assetsQuery.selectedableData?.forEach((asset) => {
      const _name = asset.name?.toLowerCase() || '';
      const _symbol = asset.symbol.toLowerCase();
      const _query = query.toLowerCase();

      const _isSelected =
        selectionRef.current.findIndex((item) => item.symbol === asset.symbol) > -1;

      if (query === '' || _isSelected || _symbol.includes(_query) || _name.includes(_query)) {
        data.push(mapAssetLayer(asset));
        addedSymbols.add(asset.symbol);
      }
    });

    // Add selected tokens from profile that aren't in assetsQuery (engine/spk/chain)
    selectionRef.current.forEach((selectedAsset) => {
      if (!addedSymbols.has(selectedAsset.symbol)) {
        const _symbol = selectedAsset.symbol.toLowerCase();
        const _query = query.toLowerCase();

        if (query === '' || _symbol.includes(_query)) {
          const { isEngine } = selectedAsset;
          const { isSpk } = selectedAsset;
          const { isChain } = selectedAsset;
          const layer = isEngine ? 'engine' : isSpk ? 'spk' : isChain ? 'chain' : undefined;

          data.push({
            symbol: selectedAsset.symbol,
            layer,
            isEngine,
            isSpk,
            isChain,
          } as SelectableAsset);
        }
      }
    });

    setListData(data);
    _updateSortedList({ data });
  }, [query, assetsQuery.selectedableData]);

  const _updateSortedList = ({ data }: { data?: SelectableAsset[] } = { data: listData }) => {
    const source = data || listData;
    const _data = source.map(mapAssetLayer);
    const selection = selectionRef.current || [];

    _data.sort((a, b) => {
      const _getSortingIndex = (e: SelectableAsset) =>
        selection.findIndex((item) => item.symbol === e.symbol);
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

    // Count only visible selected items to fix separator placement when search filters are active
    const selectedSymbols = new Set(selection.map((item) => item.symbol));
    const visibleSelectedCount = _data.filter((item) => selectedSymbols.has(item.symbol)).length;
    const insertIndex = Math.min(visibleSelectedCount, _data.length);
    _data.splice(insertIndex, 0, {
      isSectionSeparator: true,
    } as SelectableAsset);

    setSortedList(_data);
  };

  const _updateUserProfile = async () => {
    const existingTokens = currentAccount?.profile?.tokens || [];

    // 1. HIVE tokens should NEVER be in metadata (always enabled by default)
    // Filter them out if they somehow got added

    // 2. Update CHAIN tokens (external tokens) - only update visibility, never create new ones
    const selectedChainSymbols = selectionRef.current
      .filter((item) => item.isChain)
      .map((item) => item.symbol);

    const chainTokens = existingTokens
      .filter((item: ProfileToken) => item.type === TokenType.CHAIN)
      .map((item: ProfileToken) => ({
        ...item,
        meta: {
          ...item.meta,
          show: selectedChainSymbols.includes(item.symbol),
        },
      }));

    // 3. Handle ENGINE and SPK tokens (user can add/remove)
    const engineSpkTokens = selectionRef.current
      .filter((item) => (item.isEngine || item.isSpk) && item.symbol)
      .map((item) => ({
        symbol: item.symbol,
        type: item.isEngine ? TokenType.ENGINE : TokenType.SPK,
        meta: {
          show: true,
        },
      }));

    // Final tokens array - HIVE tokens excluded (always enabled by default)
    // Filter out any tokens with missing required fields
    const tokens = [...chainTokens, ...engineSpkTokens].filter(
      (token) => token.symbol && token.type,
    );

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
    const totalSel = (selectionRef.current || []).length;
    const item = sortedList[from];

    // Skip if item is section separator or invalid
    if (!item || item.isSectionSeparator || !item.symbol) {
      setSortedList(data);
      return;
    }

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
        keyExtractor={(item, index) =>
          item.isSectionSeparator ? `separator_${index}` : `token_${item.symbol}_${index}`
        }
      />
    );
  };

  const _renderContent = () => {
    // Don't render until data is loaded
    if (assetsQuery.isLoading || !assetsQuery.selectedableData) {
      return <View style={styles.modalContainer} />;
    }

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
