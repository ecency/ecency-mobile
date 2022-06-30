import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Text, Image, View, SafeAreaView, TouchableOpacity } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import VersionNumber from 'react-native-version-number';

import { Icon, MainButton, Modal } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setLastAppVersion } from '../../../redux/actions/applicationActions';
import parseVersionNumber from '../../../utils/parseVersionNumber';
import LaunchScreen from '../../launch';

import styles from './welcomeStyles';

const WelcomeModal = ({onModalVisibilityChange}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const lastAppVersion = useAppSelector(state=>state.application.lastAppVersion)

  const [showAnimation, setShowAnimation] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [appVersion] = useState(VersionNumber.appVersion);


  useEffect(() => {
    _compareAppVersion()
  }, [])


  useEffect(() => {
    if (showAnimation) {
      setTimeout(() => {
        setShowAnimation(false);
      }, 3550);
    }
  }, [showAnimation]);


  const _compareAppVersion = () => {
    if(!lastAppVersion || (parseVersionNumber(lastAppVersion) < parseVersionNumber(appVersion))){
      setShowWelcomeModal(true);
      onModalVisibilityChange(true)
    } 
  }


  const _handleButtonPress = () => {
    dispatch(setLastAppVersion(appVersion))
    setShowWelcomeModal(false);
    setTimeout(()=>{
      onModalVisibilityChange(false)
    }, 100)
    
  }


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

  const _renderContent = () => (
    <SafeAreaView style={styles.root}>
      <TouchableOpacity onPress={_handleButtonPress} style={styles.container}>
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
        </View>
        <View style={styles.bottomButton}>
          <MainButton
            onPress={_handleButtonPress}
            isDisable={false}
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
