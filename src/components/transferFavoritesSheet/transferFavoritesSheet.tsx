import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Icon } from '../icon';
import { UserAvatar } from '../userAvatar';
import { useAddFavouriteMutation, useGetFavouritesQuery } from '../../providers/queries';
import { toastNotification } from '../../redux/actions/uiAction';

const FALLBACK_SHEET_ID = 'transfer_favorites';

const normalizeUsername = (value = '') => value.trim().replace(/^@/, '').toLowerCase();

const getFavoriteUsername = (item: any) => item?.account || '';

const TransferFavoritesSheet: React.FC<SheetProps<'transfer_favorites'>> = ({
  sheetId,
  payload,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const closedRef = useRef(false);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newFavorite, setNewFavorite] = useState('');
  const { data: favorites = [], isLoading, refetch } = useGetFavouritesQuery(payload?.limit ?? 50);
  const addFavoriteMutation = useAddFavouriteMutation();
  const isAddFavoritePending = addFavoriteMutation.isPending;

  useEffect(() => {
    closedRef.current = false;
    setSearch('');
    setIsAdding(false);
    setNewFavorite('');
  }, [payload]);

  const filteredFavorites = useMemo(() => {
    const query = normalizeUsername(search);
    return favorites
      .map((item) => getFavoriteUsername(item))
      .filter(Boolean)
      .filter((username, index, list) => list.indexOf(username) === index)
      .filter((username) => !query || username.includes(query));
  }, [favorites, search]);

  const _close = (username?: string) => {
    if (closedRef.current) return;
    closedRef.current = true;
    SheetManager.hide(sheetId || FALLBACK_SHEET_ID, { payload: username });
  };

  const _handleAddFavorite = async () => {
    const username = normalizeUsername(newFavorite);
    if (!username) return;

    try {
      await addFavoriteMutation.mutateAsync(username);
      setSearch(username);
      setNewFavorite('');
      setIsAdding(false);
      refetch();
    } catch (error) {
      console.warn('[TransferFavoritesSheet] Failed to add favorite', error);
      dispatch(
        toastNotification(
          intl.formatMessage({
            id: 'favorites.add_error',
            defaultMessage: 'Could not add favorite',
          }),
        ),
      );
    }
  };

  return (
    <ActionSheet
      id={sheetId || FALLBACK_SHEET_ID}
      gestureEnabled
      closeOnTouchBackdrop
      containerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            {intl.formatMessage({ id: 'favorites.title', defaultMessage: 'Favorites' })}
          </Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsAdding((value) => !value)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={intl.formatMessage(
              isAdding
                ? { id: 'favorites.cancel_add', defaultMessage: 'Cancel adding favorite' }
                : { id: 'favorites.add', defaultMessage: 'Add a favorite' },
            )}
          >
            <Icon
              iconType="MaterialCommunityIcons"
              name={isAdding ? 'close' : 'account-plus-outline'}
              size={22}
              color={EStyleSheet.value('$primaryBlue')}
            />
          </TouchableOpacity>
        </View>

        {isAdding && (
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              value={newFavorite}
              onChangeText={setNewFavorite}
              placeholder={intl.formatMessage({
                id: 'transfer.favorite_username_placeholder',
                defaultMessage: 'Username',
              })}
              placeholderTextColor={EStyleSheet.value('$iconColor')}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={_handleAddFavorite}
              activeOpacity={0.7}
              disabled={isAddFavoritePending || !normalizeUsername(newFavorite)}
              accessibilityRole="button"
              accessibilityLabel={intl.formatMessage({
                id: 'favorites.confirm_add',
                defaultMessage: 'Save favorite',
              })}
            >
              <Icon iconType="MaterialCommunityIcons" name="check" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={intl.formatMessage({
            id: 'favorites.search',
            defaultMessage: 'Search in favorites',
          })}
          placeholderTextColor={EStyleSheet.value('$iconColor')}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} />
          </View>
        ) : (
          <FlatList
            data={filteredFavorites}
            keyExtractor={(item) => `transfer-favorite-${item}`}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {intl.formatMessage({
                  id: 'favorites.empty_list',
                  defaultMessage: 'No favorites yet',
                })}
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.favoriteRow}
                onPress={() => _close(item)}
                activeOpacity={0.7}
              >
                <UserAvatar username={item} size="medium" noAction />
                <Text style={styles.favoriteText}>@{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ActionSheet>
  );
};

export default TransferFavoritesSheet;

const styles = EStyleSheet.create({
  sheetContainer: {
    backgroundColor: '$primaryBackgroundColor',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    minHeight: 360,
    maxHeight: 560,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '$primaryBlack',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryLightBackground',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '$primaryBlack',
    backgroundColor: '$primaryLightBackground',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryBlue',
  },
  searchInput: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '$primaryBlack',
    backgroundColor: '$primaryLightBackground',
    marginBottom: 12,
  },
  loadingContainer: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    maxHeight: 360,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    paddingVertical: 8,
  },
  favoriteText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '$primaryBlack',
  },
  emptyText: {
    paddingVertical: 32,
    textAlign: 'center',
    color: '$iconColor',
    fontSize: 14,
  },
});
