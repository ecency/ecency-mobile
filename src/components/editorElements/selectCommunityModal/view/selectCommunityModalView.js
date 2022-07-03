import React from 'react';
import { View, Text, ScrollView, FlatList, Platform } from 'react-native';
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
  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <SearchInput
        style={Platform.OS === 'android' && styles.searchInput}
        onChangeText={onChangeSearch}
        placeholder="search"
        autoFocus={false}
        backEnabled={true}
        onBackPress={onCloseModal}
      />

      {showSearchedCommunities ? (
        <FlatList
          ItemSeparatorComponent={() => <Separator />}
          showsVerticalScrollIndicator={false}
          style={styles.searchedFlatList}
          data={searchedCommunities}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index, separators }) => (
            <CommunityCard
              community={item}
              key={index.toString()}
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
          {subscribedCommunities && (
            <View>
              <Text style={[globalStyles.label, styles.title]}>
                {intl.formatMessage({ id: 'editor.my_communities' }).toUpperCase()}
              </Text>
              <FlatList
                ItemSeparatorComponent={() => <Separator />}
                showsVerticalScrollIndicator={false}
                data={subscribedCommunities}
                keyExtractor={(item, index) => index.toString()}
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
          {!topCommunities.loading && !topCommunities.error && topCommunities.data?.length > 0 && (
            <View>
              <Text style={[globalStyles.label, styles.title]}>
                {intl.formatMessage({ id: 'editor.top_communities' }).toUpperCase()}
              </Text>
              <FlatList
                ItemSeparatorComponent={() => <Separator />}
                showsVerticalScrollIndicator={false}
                data={topCommunities.data}
                keyExtractor={(item, index) => index.toString()}
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

export default injectIntl(SelectCommunityModalView);
