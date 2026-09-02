import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { debounce } from 'lodash';
import { useIntl } from 'react-intl';
import { normalizeTag } from '@ecency/sdk';

// Components
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { TabItem } from 'components/tabbedPosts/types/tabbedPosts.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainButton, SearchInput, TabbedPosts } from '../../../components';
import { useAuth } from '../../../hooks';
import {
  useAddFavoriteTagMutation,
  useDeleteFavoriteTagMutation,
  useGetFavoriteTagsQuery,
} from '../../../providers/queries';

// Styles
import styles from './tagResultStyles';

import { GLOBAL_POST_FILTERS, GLOBAL_POST_FILTERS_VALUE } from '../../../constants/options/filters';

/**
 * Follow / Following for the tag on screen. Reads the whole followed list (one
 * cached page at the cap) rather than a check request per keystroke, and holds
 * the button while that list is loading or refetching so a stale "not followed"
 * cannot take a second follow. Hidden for a signed-out reader, for a community
 * name and for anything the tag rule refuses, which is when the server would
 * refuse it too.
 */
const FollowTagButton = ({ tag }: { tag: string }) => {
  const intl = useIntl();
  const { username, code } = useAuth();
  const normalized = useMemo(() => normalizeTag(tag), [tag]);
  const { data: followedTags, isPending, isFetching, isError } = useGetFavoriteTagsQuery();
  const addMutation = useAddFavoriteTagMutation();
  const deleteMutation = useDeleteFavoriteTagMutation();

  if (!username || !code || !normalized) {
    return null;
  }

  const followed = followedTags.some((item) => item.tag === normalized);
  const busy =
    addMutation.isPending || deleteMutation.isPending || isFetching || (isPending && !isError);

  const _onPress = () => {
    if (busy) {
      return;
    }
    if (followed) {
      deleteMutation.mutate(normalized);
    } else {
      addMutation.mutate(normalized);
    }
  };

  return (
    <View style={styles.followRow}>
      <Text style={styles.followHint} numberOfLines={1}>
        {intl.formatMessage({
          id: followed ? 'favorite_tags.following_hint' : 'favorite_tags.hint',
        })}
      </Text>
      <MainButton
        style={styles.followButton}
        textStyle={styles.followButtonText}
        height={32}
        isLoading={busy}
        onPress={_onPress}
        text={intl.formatMessage({
          id: followed ? 'favorite_tags.following' : 'favorite_tags.follow',
        })}
      />
    </View>
  );
};

const TagResultScreen = ({ navigation, route }: any) => {
  const initTag = route.params?.tag ?? '';
  const filter = route.params?.filter ?? '';

  const [tag, setTag] = useState(initTag.trim());

  const _navigationGoBack = () => {
    navigation.goBack();
  };

  const _setTag = debounce((tag) => {
    setTag(tag);
  }, 1000);

  const _getSelectedIndex = () => {
    if (filter) {
      const selectedIndex = GLOBAL_POST_FILTERS_VALUE.indexOf(filter);
      if (selectedIndex > 0) {
        return selectedIndex;
      }
    }
    return 0;
  };

  const tabFilters = GLOBAL_POST_FILTERS_VALUE.map(
    (key, index) =>
      ({
        filterKey: key,
        label: GLOBAL_POST_FILTERS[index],
      } as TabItem),
  );

  return (
    <SafeAreaView style={styles.container}>
      <SearchInput
        showClearButton={true}
        autoFocus={false}
        onChangeText={_setTag}
        value={tag}
        prefix="#"
        backEnabled={true}
        onBackPress={_navigationGoBack}
      />

      <FollowTagButton tag={tag} />

      <View style={styles.tabbarItem}>
        <TabbedPosts
          {...({} as any)}
          key={tag}
          tabFilters={tabFilters}
          selectedOptionIndex={_getSelectedIndex()}
          tag={tag}
        />
      </View>
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(TagResultScreen);
