import React, { useState, useEffect } from 'react';
import { Text, Platform, SectionList } from 'react-native';
import { injectIntl } from 'react-intl';

import CommunityCard from '../../../communityCard';
import { SearchInput } from '../../../searchInput';
import { Separator } from '../../../basicUIElements';

import globalStyles from '../../../../globalStyles';
import styles from './selectCommunityModalStyles';

const SelectCommunityModalView = ({
  topCommunities,
  subscribedCommunities,
  onPressCommunity,
  onChangeSearch,
  onPressCloseForSearch,
  searchedCommunities,
  showSearchedCommunities,
  currentAccount,
  onCloseModal,
  intl,
}) => {
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    const _sections: any[] = [];

    if (showSearchedCommunities) {
      _sections.push({
        data: searchedCommunities,
      });
    } else {
      if (subscribedCommunities) {
        _sections.push({
          sectionTitle: intl.formatMessage({ id: 'editor.my_communities' }).toUpperCase(),
          data: subscribedCommunities.map((item) => ({ name: item[0], title: item[1] })),
        });
      }

      if (!topCommunities.isLoading && !topCommunities.error && topCommunities.data?.length > 0) {
        _sections.push({
          sectionTitle: intl.formatMessage({ id: 'editor.top_communities' }).toUpperCase(),
          data: topCommunities.data,
        });
      }
    }
    setSections(_sections);
  }, [showSearchedCommunities, subscribedCommunities, topCommunities, searchedCommunities]);

  const _listHeader = (
    <>
      <SearchInput
        style={Platform.OS === 'android' && styles.searchInput}
        onChangeText={onChangeSearch}
        placeholder="search"
        autoFocus={false}
        backEnabled={true}
        onBackPress={onCloseModal}
      />
      {!showSearchedCommunities && (
        <>
          <Text style={[globalStyles.label, styles.title]}>
            {intl.formatMessage({ id: 'editor.my_blog' }).toUpperCase()}
          </Text>
          <CommunityCard
            community={{
              name: currentAccount.name,
              title: intl.formatMessage({ id: 'editor.my_blog' }),
            }}
            onPress={() => onPressCommunity(null)}
          />
        </>
      )}
    </>
  );

  const _renderSectionHeader = ({ section }) => (
    <Text style={[globalStyles.label, styles.title]}>{section.sectionTitle}</Text>
  );

  const _renderItem = ({ item, index, separators }) => (
    <CommunityCard
      community={item}
      key={index.toString()}
      onPress={onPressCommunity}
      separators={separators}
    />
  );

  return (
    <SectionList
      style={{ flex: 1 }}
      stickySectionHeadersEnabled={false}
      sections={sections}
      ItemSeparatorComponent={() => <Separator />}
      ListHeaderComponent={_listHeader}
      renderSectionHeader={_renderSectionHeader}
      renderItem={_renderItem}
      keyExtractor={(item, index) => index.toString()}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default injectIntl(SelectCommunityModalView);
