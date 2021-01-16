import React from 'react';
import { SafeAreaView, FlatList } from 'react-native';

// Components
import { CommunitiesPlaceHolder } from '../../basicUIElements';
import CommunitiesListItem from './communitiesListItem';

// Styles
import styles from './communitiesListStyles';

const CommunitiesList = ({
  data,
  handleOnPress,
  handleSubscribeButtonPress,
  isLoggedIn,
  noResult,
}) => {
  const _renderItem = ({ item, index }) => {
    return (
      <CommunitiesListItem
        index={index}
        title={item.title}
        about={item.about}
        admins={item.admins}
        id={item.id}
        authors={item.num_authors}
        posts={item.num_pending}
        subscribers={item.subscribers}
        isNsfw={item.is_nsfw}
        name={item.name}
        handleOnPress={handleOnPress}
        handleSubscribeButtonPress={handleSubscribeButtonPress}
        isSubscribed={item.isSubscribed}
        isLoggedIn={isLoggedIn}
        loading={item.loading}
      />
    );
  };

  const _renderEmptyContent = () => {
    return (
      <>
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {!noResult && (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id && item.id.toString()}
          renderItem={_renderItem}
          ListEmptyComponent={_renderEmptyContent}
        />
      )}
    </SafeAreaView>
  );
};

export default CommunitiesList;
