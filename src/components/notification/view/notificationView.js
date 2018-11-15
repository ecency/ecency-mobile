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
        // {
        //   name: 'esteemapp',
        //   title: '25% likes your post:',
        //   description: 'My own Top 5 eSteem Surfer Features',
        //   image: 'https://steemitimages.com/u/feruz/avatar/small',
        //   date: 'yesterday',
        // },
        // {
        //   name: 'esteemapp',
        //   title: '25% likes your post:',
        //   avatar: 'https://steemitimages.com/u/feruz/avatar/small',
        //   description: 'My own Top 5 eSteem Surfer Featuresasassasasaasas',
        //   date: 'yesterday',
        // },
        // {
        //   name: 'esteemapp',
        //   title: '25% likes your post:',
        //   avatar: 'https://steemitimages.com/u/feruz/avatar/small',
        //   description: 'My own Top 5 eSteem Surfer Features',
        //   image: 'https://steemitimages.com/u/feruz/avatar/small',
        //   date: 'yesterday',
        // },
      ],
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleOnDropdownSelect = (index) => {
    console.log(`selected index is:${index}`);
  };

  render() {
    const { notifications } = this.props;

    return (
      <View style={styles.container}>
        <FilterBar
          dropdownIconName="md-arrow-dropdown"
          options={['ALL ACTIVITIES', 'VOTES', 'REPLIES', 'MENTIONS', 'FOLLOWS', 'REBLOGS']}
          defaultText="ALL NOTIFICATION"
          onDropdownSelect={this._handleOnDropdownSelect}
          rightIconName="ios-checkmark"
        />
        <ScrollView style={styles.scrollView}>
          <ContainerHeader hasSeperator isBoldTitle title="Recent" />
          <FlatList
            data={notifications}
            renderItem={({ item }) => <NotificationLine notification={item} />}
            keyExtractor={item => item.email}
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
