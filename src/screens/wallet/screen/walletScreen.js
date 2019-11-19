import React, { Fragment, useState } from 'react';
import Swiper from 'react-native-swiper';
import { SafeAreaView } from 'react-native';

// Containers
import { LoggedInContainer } from '../../../containers';

// Components
import { Header, Transaction } from '../../../components';
import EstmView from './estmView';
import SteemView from './steemView';

// Styles
import styles from './pointsStyles';

const WalletScreen = () => {
  const [selectedUserActivities, setSelectedUserActivities] = useState(null);
  const [selectedType, setSelectedType] = useState('points');
  const [currentIndex, setCurrentIndex] = useState(0);

  const _handleSwipeItemChange = (userActivities, type) => {
    setSelectedUserActivities(userActivities);
    setSelectedType(type);
  };

  return (
    <Fragment>
      <Header />
      <SafeAreaView style={styles.container}>
        <LoggedInContainer>
          {() => (
            <>
              <Swiper
                loop={false}
                showsPagination={true}
                index={0}
                onIndexChanged={index => setCurrentIndex(index)}
              >
                <EstmView
                  index={0}
                  handleOnSelected={_handleSwipeItemChange}
                  currentIndex={currentIndex}
                />
                <SteemView
                  index={1}
                  handleOnSelected={_handleSwipeItemChange}
                  currentIndex={currentIndex}
                />
              </Swiper>

              <Transaction type="wallet" transactions={selectedUserActivities} />
            </>
          )}
        </LoggedInContainer>
      </SafeAreaView>
    </Fragment>
  );
};

export default WalletScreen;
