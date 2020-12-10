import React from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import globalStyles from '../../../../globalStyles';

import CommunityCard from '../../../communityCard';

import styles from './selectCommunityModalStyles';

const SelectCommunityModalView = ({ topCommunities, subscribedCommunities }) => {
  console.log('SelectCommunityModalView', topCommunities);
  return (
    <ScrollView>
      {!topCommunities.loading && !topCommunities.error && topCommunities.data.length > 0 && (
        <View>
          <Text style={globalStyles.title}>Top Rated</Text>
          <FlatList
            showsVerticalScrollIndicator={false}
            style={styles.flatList}
            data={topCommunities.data}
            renderItem={({ item, index }) => <CommunityCard community={item} key={item.name} />}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default SelectCommunityModalView;
