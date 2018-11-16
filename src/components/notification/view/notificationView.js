import React, { Component } from 'react';
import { View, ScrollView, FlatList } from 'react-native';

// Constants

// Components
import { ContainerHeader } from '../../containerHeader';
import { FilterBar } from '../../filterBar';
import NotificationLine from '../../notificationLine';

// Styles
import styles from './notificationStyles';

class NotificationView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */
  constructor(props) {
    super(props);
    this.state = {
      // NOTE: DOMI DATA! them gonna remove!
      notification: [
        {
          name: 'esteemapp',
          title: 'eSteem Mobile!',
          avatar: 'https://steemitimages.com/u/feruz/avatar/small',
          description: 'eSteem app with new ui!',
          image: 'https://steemitimages.com/u/feruz/avatar/small',
          // date: 'today',
          isNew: true,
        },
      ],
      filters: [
        { key: 'activities', value: 'ALL ACTIVITIES' },
        { key: 'votes', value: 'VOTES' },
        { key: 'replies', value: 'REPLIES' },
        { key: 'mentions', value: 'MENTIONS' },
        { key: 'follows', value: 'FOLLOWS' },
        { key: 'reblogs', value: 'REBLOGS' },
      ],
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleOnDropdownSelect = (index) => {
    const { getActivities } = this.props;
    const { filters } = this.state;

    getActivities(filters[index].key);
  };

  render() {
    const { notifications } = this.props;
    const { filters } = this.state;

    return (
      <View style={styles.container}>
        <FilterBar
          dropdownIconName="md-arrow-dropdown"
          options={filters.map(item => item.value)}
          defaultText="ALL ACTIVITIES"
          onDropdownSelect={this._handleOnDropdownSelect}
          rightIconName="ios-checkmark"
        />
        <ScrollView style={styles.scrollView}>
          <ContainerHeader hasSeperator isBoldTitle title="Recent" />
          <FlatList
            data={notifications}
            renderItem={({ item }) => <NotificationLine notification={item} />}
            keyExtractor={item => item.id}
          />
          {/* Will remove follow lines */}
          {/* <ContainerHeader hasSeperator isBoldTitle title="Yesterday" />
          <FlatList
            data={notification}
            renderItem={({ item }) => this._getRenderItem(item)}
            keyExtractor={item => item.email}
          /> */}
        </ScrollView>
      </View>
    );
  }
}

export default NotificationView;
