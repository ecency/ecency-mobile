import React from 'react';
import { SafeAreaView, FlatList } from 'react-native';
import { withNavigation } from 'react-navigation';

// Components
import CommunitiesListItem from './CommunitiesListItem';
import { CommunitiesPlaceHolder } from '../../../components/basicUIElements';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './communitiesListStyles';

const VotersDisplayView = ({ votes, navigation }) => {
  const _renderItem = (item, index) => {
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
      <FlatList
        data={votes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => _renderItem(item, index)}
        ListEmptyComponent={_renderEmptyContent}
      />
    </SafeAreaView>
  );
};

export default withNavigation(VotersDisplayView);
