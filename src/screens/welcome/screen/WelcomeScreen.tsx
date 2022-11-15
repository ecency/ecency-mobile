import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Text, Image, View, SafeAreaView, TouchableOpacity } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import { gestureHandlerRootHOC, ScrollView } from 'react-native-gesture-handler';
import VersionNumber from 'react-native-version-number';

import { CheckBox, Icon, MainButton } from '../../../components';
import { ECENCY_TERMS_URL } from '../../../config/ecencyApi';
import ROUTES from '../../../constants/routeNames';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setLastAppVersion, setIsTermsAccepted } from '../../../redux/actions/applicationActions';
import LaunchScreen from '../../launch';

import styles from '../children/WelcomeScreenStyles';

const WelcomeScreen = () => {
  const intl = useIntl();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const isTermsAccepted = useAppSelector((state) => state.application.isTermsAccepted);
  const [showAnimation, setShowAnimation] = useState(true);
  const [isConsentChecked, setIsConsentChecked] = useState(isTermsAccepted);
  const [appVersion] = useState(VersionNumber.appVersion);

  useEffect(() => {
    _showWelcomeModal();
  }, []);

  const _showWelcomeModal = () => {
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 3550);
  };

  const _handleButtonPress = () => {
    dispatch(setLastAppVersion(appVersion));
    dispatch(setIsTermsAccepted(isConsentChecked));

    navigation.navigate(ROUTES.STACK.MAIN);
  };

  const _onCheckPress = (value, isCheck) => {
    setIsConsentChecked(isCheck);
  };

  const _onTermsPress = () => {
    const url = ECENCY_TERMS_URL;
    navigation.navigate({
      name: ROUTES.SCREENS.WEB_BROWSER,
      params: {
        url,
      },
      key: url,
    });
  };

  const _renderInfo = (iconName, headingIntlId, bodyIntlId) => (
    <View style={styles.sectionRow}>
      <Icon
        iconType="SimpleLineIcons"
        name={iconName}
        color={EStyleSheet.value('$primaryBlue')}
        size={30}
      />
      <View>
        <Text style={styles.sectionTitle}>{intl.formatMessage({ id: headingIntlId })}</Text>
        <Text style={styles.sectionText}>{intl.formatMessage({ id: bodyIntlId })}</Text>
      </View>
    </View>
  );

  const _renderConsent = () => (
    <View style={styles.consentContainer}>
      <CheckBox isChecked={isConsentChecked} clicked={_onCheckPress} style={styles.checkStyle} />
      <TouchableOpacity onPress={_onTermsPress}>
        <View style={styles.consentTextContainer}>
          <Text style={styles.termsDescText}>
            {intl.formatMessage({
              id: 'welcome.terms_description',
            })}
            <Text style={styles.termsLinkText}>
              {' '}
              {intl.formatMessage({
                id: 'welcome.terms_text',
              })}
            </Text>
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Image
          style={styles.mascot}
          resizeMode="contain"
          source={require('../../../assets/love_mascot.png')}
        />

        <View style={styles.topText}>
          <Text style={styles.welcomeText}>{intl.formatMessage({ id: 'welcome.label' })}</Text>
          <Text style={styles.ecencyText}>{intl.formatMessage({ id: 'welcome.title' })}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <TouchableOpacity disabled={!isConsentChecked} onPress={_handleButtonPress}>
            {_renderInfo('question', 'welcome.line1_heading', 'welcome.line1_body')}
            {_renderInfo('emotsmile', 'welcome.line2_heading', 'welcome.line2_body')}
            {_renderInfo('people', 'welcome.line3_heading', 'welcome.line3_body')}
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottomContainer}>
          {_renderConsent()}
          <MainButton
            onPress={_handleButtonPress}
            isDisable={!isConsentChecked}
            isLoading={false}
            style={{ alignSelf: 'center', paddingHorizontal: 30 }}
            text={intl.formatMessage({ id: 'welcome.get_started' })}
          />
        </View>
      </View>

      {showAnimation && <LaunchScreen />}
    </SafeAreaView>
  );
};

export default gestureHandlerRootHOC(WelcomeScreen);
