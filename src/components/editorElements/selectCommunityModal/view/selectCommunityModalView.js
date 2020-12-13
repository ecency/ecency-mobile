import React from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { injectIntl } from 'react-intl';

import CommunityCard from '../../../communityCard';
import { SearchInput } from '../../../searchInput';

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
  intl,
}) => {
  console.log(subscribedCommunities, 'subscribedCommunities');
  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <SearchInput onChangeText={onChangeSearch} placeholder="search" autoFocus={false} />
      {showSearchedCommunities ? (
        <FlatList
          ItemSeparatorComponent={() => <Separator />}
          showsVerticalScrollIndicator={false}
          style={styles.searchedFlatList}
          data={searchedCommunities}
          renderItem={({ item, index, separators }) => (
            <CommunityCard
              community={item}
              key={index}
              onPress={onPressCommunity}
              separators={separators}
            />
          )}
        />
      ) : (
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
          {!subscribedCommunities.loading &&
            !subscribedCommunities.error &&
            subscribedCommunities.data.length > 0 && (
              <View>
                <Text style={[globalStyles.label, styles.title]}>
                  {intl.formatMessage({ id: 'editor.my_communities' }).toUpperCase()}
                </Text>
                <FlatList
                  ItemSeparatorComponent={() => <Separator />}
                  showsVerticalScrollIndicator={false}
                  data={subscribedCommunities.data}
                  renderItem={({ item, index, separators }) => {
                    const community = { name: item[0], title: item[1] };
                    return (
                      <CommunityCard
                        community={community}
                        key={community.name}
                        onPress={onPressCommunity}
                        separators={separators}
                      />
                    );
                  }}
                />
              </View>
            )}
          {!topCommunities.loading && !topCommunities.error && topCommunities.data.length > 0 && (
            <View>
              <Text style={[globalStyles.label, styles.title]}>
                {' '}
                {intl.formatMessage({ id: 'editor.top_communities' }).toUpperCase()}
              </Text>
              <FlatList
                ItemSeparatorComponent={() => <Separator />}
                showsVerticalScrollIndicator={false}
                data={topCommunities.data}
                renderItem={({ item, index, separators }) => (
                  <CommunityCard
                    community={item}
                    key={item.name}
                    onPress={onPressCommunity}
                    separators={separators}
                  />
                )}
              />
            </View>
          )}
        </>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const Separator = () => <View style={styles.separator} />;

export default injectIntl(SelectCommunityModalView);
