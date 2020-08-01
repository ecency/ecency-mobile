import React from 'react';
import { Text, Image, View, SafeAreaView } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { Icon, MainButton } from '../../../components';

import styles from './welcomeStyles';

const WelcomeScreen = ({ handleButtonPress }) => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        <Image style={styles.mascot} source={require('../../../assets/love_mascot.png')} />
        <View style={styles.topText}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.ecencyText}>Ecency</Text>
        </View>
        <View style={styles.sectionRow}>
          <Icon
            iconType="SimpleLineIcons"
            name="question"
            color={EStyleSheet.value('$primaryBlue')}
            size={30}
          />
          <View>
            <Text style={styles.sectionTitle}>Are you looking for community?</Text>
            <Text style={styles.sectionText}>
              Uncensored, immutable, rewarding, decentralized, that you own.
            </Text>
          </View>
        </View>
        <View style={styles.sectionRow}>
          <Icon
            iconType="SimpleLineIcons"
            name="emotsmile"
            color={EStyleSheet.value('$primaryBlue')}
            size={30}
          />
          <View>
            <Text style={styles.sectionTitle}>We have a solution!</Text>
            <Text style={styles.sectionText}>
              Utilizing blockchain, censorship-free, decentralized and rewarding.
            </Text>
          </View>
        </View>
        <View style={styles.sectionRow}>
          <Icon
            iconType="SimpleLineIcons"
            name="people"
            color={EStyleSheet.value('$primaryBlue')}
            size={30}
          />
          <View>
            <Text style={styles.sectionTitle}>Join Ecency communities!</Text>
            <Text style={styles.sectionText}>
              Build community you own, get rewarded and reward others.
            </Text>
          </View>
        </View>
        <MainButton
          onPress={handleButtonPress}
          style={{ alignSelf: 'center', paddingHorizontal: 30 }}
          text="Get started!"
        />
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
