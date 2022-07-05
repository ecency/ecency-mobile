import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Text, Image, View, SafeAreaView, TouchableOpacity, Linking } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import VersionNumber from 'react-native-version-number';

import { CheckBox, Icon, MainButton, Modal } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setLastAppVersion } from '../../../redux/actions/applicationActions';
import parseVersionNumber from '../../../utils/parseVersionNumber';
import LaunchScreen from '../../launch';

import styles from './welcomeStyles';

const WelcomeModal = ({ onModalVisibilityChange }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const lastAppVersion = useAppSelector(state => state.application.lastAppVersion)

  const [showAnimation, setShowAnimation] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  const [appVersion] = useState(VersionNumber.appVersion);


  useEffect(() => {
    _compareAppVersion()
    _showWelcomeModal();

  }, [])


  const _compareAppVersion = () => {
    if (!lastAppVersion || (parseVersionNumber(lastAppVersion) < parseVersionNumber(appVersion))) {
      _showWelcomeModal();
    }
  }

  const _showWelcomeModal = () => {
    setShowWelcomeModal(true);
    onModalVisibilityChange(true);
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 3550);
  }


  const _handleButtonPress = () => {
    dispatch(setLastAppVersion(appVersion))
    setShowWelcomeModal(false);
    onModalVisibilityChange(false);
  }

  const _onCheckPress = (value, isCheck) => {
    setIsConsentChecked(isCheck);
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
      <CheckBox value={isConsentChecked} clicked={_onCheckPress} style={styles.checkStyle} />
      <TouchableOpacity onPress={() => Linking.openURL('https://ecency.com/terms-of-service')}>
        <View style={styles.consentTextContainer}>
          <Text style={styles.termsDescText}>
            {intl.formatMessage({
              id: 'welcome.terms_description',
            })}
            <Text style={styles.termsLinkText}>
              {intl.formatMessage({
                id: 'welcome.terms_text',
              })}
            </Text>
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const _renderContent = () => (
    <SafeAreaView style={styles.root}>
      <TouchableOpacity disabled={!isConsentChecked} onPress={_handleButtonPress} style={styles.container}>
        <Image
          style={styles.mascot}
          resizeMode="contain"
          source={require('../../../assets/love_mascot.png')}
        />
        <View style={styles.topText}>
          <Text style={styles.welcomeText}>{intl.formatMessage({ id: 'welcome.label' })}</Text>
          <Text style={styles.ecencyText}>{intl.formatMessage({ id: 'welcome.title' })}</Text>
        </View>
        <View>
          {_renderInfo('question', 'welcome.line1_heading', 'welcome.line1_body')}
          {_renderInfo('emotsmile', 'welcome.line2_heading', 'welcome.line2_body')}
          {_renderInfo('people', 'welcome.line3_heading', 'welcome.line3_body')}
          {_renderConsent()}
        </View>
        <View style={styles.bottomButton}>
          <MainButton
            onPress={_handleButtonPress}
            isDisable={!isConsentChecked}
            isLoading={false}
            style={{ alignSelf: 'center', paddingHorizontal: 30 }}
            text={intl.formatMessage({ id: 'welcome.get_started' })}
          />
        </View>
      </TouchableOpacity>
      {showAnimation && <LaunchScreen />}
    </SafeAreaView>
  );


  return (
    <Modal
      isOpen={showWelcomeModal}
      isFullScreen
      swipeToClose={false}
      backButtonClose={false}
      style={{ margin: 0 }}
    >
      {_renderContent()}
    </Modal>)
};

export default WelcomeModal;
