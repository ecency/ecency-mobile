import React from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import globalStyles from '../../../../globalStyles';

import CommunityCard from '../../../communityCard';

import { SearchInput } from '../../../searchInput';

import styles from './selectCommunityModalStyles';

const SelectCommunityModalView = ({
  topCommunities,
  subscribedCommunities,
  onPressCommunity,
  onChangeSearch,
  onPressCloseForSearch,
  searchedCommunities,
  showSearchedCommunities,
}) => {
  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <SearchInput
        handleOnModalClose={onPressCloseForSearch}
        onChangeText={onChangeSearch}
        placeholder="search"
        autoFocus={false}
      />
      {showSearchedCommunities ? (
        <FlatList
          ItemSeparatorComponent={() => <Separator />}
          showsVerticalScrollIndicator={false}
          style={styles.searchedFlatList}
          data={searchedCommunities}
          renderItem={({ item, index, separators }) => (
            <CommunityCard
              community={item}
              key={item.name}
              onPress={onPressCommunity}
              separators={separators}
            />
          )}
        />
      ) : (
        <>
          <Text style={[globalStyles.label, styles.title]}>MY BLOG</Text>
          <CommunityCard
            community={{ name: 'furkankilic', title: 'My Blog' }}
            onPress={() => onPressCommunity(null)}
          />
          {!topCommunities.loading && !topCommunities.error && topCommunities.data.length > 0 && (
            <View>
              <Text style={[globalStyles.label, styles.title]}>TOP RATED</Text>
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
          {!subscribedCommunities.loading &&
            !subscribedCommunities.error &&
            subscribedCommunities.data.length > 0 && (
              <View>
                <Text style={[globalStyles.label, styles.title]}>SUBSCRIBED</Text>
                <FlatList
                  ItemSeparatorComponent={() => <Separator />}
                  showsVerticalScrollIndicator={false}
                  data={subscribedCommunities.data}
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
    </ScrollView>
  );
};

const Separator = () => <View style={styles.separator} />;

export default SelectCommunityModalView;
