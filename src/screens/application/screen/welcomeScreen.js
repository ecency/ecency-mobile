import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Text, Image, View, SafeAreaView, TouchableOpacity, Linking } from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import { CheckBox, Icon, MainButton } from '../../../components';

import styles from '../children/welcomeStyles';

const WelcomeScreen = ({ handleButtonPress }) => {
  const intl = useIntl();
  const [isConsentChecked, setIsConsentChecked] = useState(false);

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
        <View>
          {_renderInfo('question', 'welcome.line1_heading', 'welcome.line1_body')}
          {_renderInfo('emotsmile', 'welcome.line2_heading', 'welcome.line2_body')}
          {_renderInfo('people', 'welcome.line3_heading', 'welcome.line3_body')}
          {_renderConsent()}
        </View>
        <View style={styles.bottomButton}>
          <MainButton
            onPress={handleButtonPress}
            isDisable={!isConsentChecked}
            isLoading={false}
            style={{ alignSelf: 'center', paddingHorizontal: 30 }}
            text={intl.formatMessage({ id: 'welcome.get_started' })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
