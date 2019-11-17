/* eslint-disable react/jsx-wrap-multilines */
import React, { useRef, Fragment } from 'react';
import { Text, View, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import { get } from 'lodash';
import { withNavigation } from 'react-navigation';

// Components
import { LineBreak, WalletLineItem, ListPlaceHolder } from '../../basicUIElements';
import { Icon, MainButton, DropdownButton, CollapsibleCard, HorizontalIconList } from '../..';
import { ThemeContainer } from '../../../containers';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Constants
import POINTS, { POINTS_KEYS } from '../../../constants/options/points';
import { default as ROUTES } from '../../../constants/routeNames';

// Styles
import styles from './pointsStyles';
//     dropdownRef = React.createRef();

const PointsView = ({
  fetchUserActivity,
  refreshing,
  isLoading,
  claim,
  isClaiming,
  userActivities,
  handleOnDropdownSelected,
  navigation,
  unclaimedBalance,
  userBalance,
  dropdownOptions,
  type = '',
}) => {
  const intl = useIntl();
  const dropdownRef = useRef();
  const refreshControl = () => (
    <ThemeContainer>
      {isDarkTheme => (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchUserActivity}
          progressBackgroundColor="#357CE6"
          tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
          titleColor="#fff"
          colors={['#fff']}
        />
      )}
    </ThemeContainer>
  );

  const _getTranslation = id => {
    let translation;

    try {
      translation = intl.formatMessage({ id });
    } catch (error) {
      translation = '';
    }

    return translation;
  };

  const _renderLoading = () => {
    if (isLoading) {
      return <ListPlaceHolder />;
    }

    return <Text style={styles.subText}>{intl.formatMessage({ id: 'points.no_activity' })}</Text>;
  };

  return (
    <Fragment>
      <LineBreak height={12} />
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={() => refreshControl()}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.pointsWrapper}>
          <Text onPress={() => dropdownRef.current.show()} style={styles.pointText}>
            {userBalance}
          </Text>
          <DropdownButton
            dropdownRowWrapper={styles.dropdownRowStyle}
            dropdownRef={dropdownRef}
            isHasChildIcon
            iconName="arrow-drop-down"
            options={dropdownOptions}
            noHighlight
            dropdownButtonStyle={styles.dropdownButtonStyle}
            onSelect={handleOnDropdownSelected}
            rowTextStyle={styles.dropdownRowText}
            dropdownStyle={styles.dropdownStyle}
          />
        </View>
        <Text style={styles.subText}>{intl.formatMessage({ id: 'points.esteemPoints' })}</Text>

        <MainButton
          isLoading={isClaiming}
          isDisable={isClaiming}
          style={styles.mainButton}
          height={50}
          onPress={() =>
            unclaimedBalance > 0 ? claim() : navigation.navigate(ROUTES.SCREENS.BOOST)
          }
        >
          <View style={styles.mainButtonWrapper}>
            <Text style={styles.unclaimedText}>
              {unclaimedBalance > 0 ? unclaimedBalance : intl.formatMessage({ id: 'boost.buy' })}
            </Text>
            <View style={styles.mainIconWrapper}>
              <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
            </View>
          </View>
        </MainButton>

        <HorizontalIconList options={POINTS} optionsKeys={POINTS_KEYS} />

        <View style={styles.listWrapper}>
          <FlatList
            data={userActivities}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={_renderLoading()}
            renderItem={({ item, index }) => (
              <CollapsibleCard
                key={item.id.toString()}
                noBorder
                noContainer
                titleComponent={
                  <WalletLineItem
                    index={index + 1}
                    text={_getTranslation(get(item, 'textKey'))}
                    description={getTimeFromNow(get(item, 'created'))}
                    isCircleIcon
                    isThin
                    isBlackText
                    iconName={get(item, 'icon')}
                    iconType={get(item, 'iconType')}
                    rightText={`${get(item, 'amount')} ${type.toUpperCase()}`}
                  />
                }
              >
                {(get(item, 'memo') || get(item, 'sender')) && (
                  <WalletLineItem
                    isBlackText
                    isThin
                    text={
                      get(item, 'sender')
                        ? `${intl.formatMessage({ id: 'points.from' })} @${get(item, 'sender')}`
                        : get(item, 'receiver') &&
                          `${intl.formatMessage({ id: 'points.to' })} @${get(item, 'receiver')}`
                    }
                    description={get(item, 'memo')}
                  />
                )}
              </CollapsibleCard>
            )}
          />
        </View>
      </ScrollView>
    </Fragment>
  );
};

export default withNavigation(PointsView);
