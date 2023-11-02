import React from 'react';
import { SafeAreaView, FlatList } from 'react-native';

// Components
import { CommunitiesPlaceHolder } from '../../basicUIElements';
import CommunitiesListItem from './communitiesListItem';

// Styles
import styles from './communitiesListStyles';

const CommunitiesList = ({
  data,
  subscribingCommunities,
  handleOnPress,
  handleSubscribeButtonPress,
  isLoggedIn,
  noResult,
  screen,
  isDiscoversLoading,
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
        loading={
          subscribingCommunities &&
          subscribingCommunities[item.name] &&
          subscribingCommunities[item.name].loading
        }
        screen={screen}
      />
    );
  };

  const _renderEmptyContent = () => {
    return (
      isDiscoversLoading && (
        <>
          <CommunitiesPlaceHolder />
          <CommunitiesPlaceHolder />
          <CommunitiesPlaceHolder />
          <CommunitiesPlaceHolder />
          <CommunitiesPlaceHolder />
          <CommunitiesPlaceHolder />
          <CommunitiesPlaceHolder />
        </>
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={true && _renderItem}
        ListEmptyComponent={_renderEmptyContent}
        ListFooterComponent={isDiscoversLoading && <CommunitiesPlaceHolder />}
      />
    </SafeAreaView>
  );
};

export default CommunitiesList;
