import React from 'react';
import { SafeAreaView, FlatList } from 'react-native';

// Components
import CommunitiesListItem from './CommunitiesListItem';
import { CommunitiesPlaceHolder } from '../../../components/basicUIElements';

// Styles
import styles from './communitiesListStyles';

const VotersDisplayView = ({
  votes,
  handleOnPress,
  handleSubscribeButtonPress,
  allSubscriptions,
  isLoggedIn,
  noResult,
}) => {
  const _renderItem = (item, index) => {
    const isSubscribed = allSubscriptions.some((sub) => sub[0] === item.name);

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
        isSubscribed={isSubscribed}
        isLoggedIn={isLoggedIn}
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
          data={votes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => _renderItem(item, index)}
          ListEmptyComponent={_renderEmptyContent}
        />
      )}
    </SafeAreaView>
  );
};

export default VotersDisplayView;
