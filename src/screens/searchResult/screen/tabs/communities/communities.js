import React from 'react';
import { useIntl } from 'react-intl';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import get from 'lodash/get';

// Components
import { FilterBar, UserAvatar } from '../../../../../components';
import CommunitiesList from './communitiesList';
import { CommunitiesPlaceHolder } from '../../../../../components/basicUIElements';

//import CommunitiesContainer from '../../../container/communitiesContainer';
import styles from '../topics/topicsResultsStyles';
import DEFAULT_IMAGE from '../../../../../assets/no_image.png';
import Tag from '../../../../../components/basicUIElements/view/tag/tagView';

const filterOptions = ['my', 'rank', 'subs', 'new'];

const CommunitiesScreen = ({ navigation, searchValue }) => {
  const intl = useIntl();

  const activeVotes = get(navigation, 'state.params.activeVotes');

  const _renderEmptyContent = () => {
    return (
      <>
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
        <CommunitiesPlaceHolder />
      </>
    );
  };

  return (
    // <CommunitiesContainer data={activeVotes} searchValue={searchValue}>
    //   {({ data, allSubscriptions, handleOnPress, handleSubscribeButtonPress, isLoggedIn }) => (
    //     <>
    //       {/* <CommunitiesList
    //         votes={data}
    //         allSubscriptions={allSubscriptions}
    //         handleOnPress={handleOnPress}
    //         handleSubscribeButtonPress={handleSubscribeButtonPress}
    //         isLoggedIn={isLoggedIn}
    //         noResult={data.length === 0}
    //       /> */}
    //     </>
    //   )}
    // </CommunitiesContainer>
    <></>
  );
};

export default CommunitiesScreen;
