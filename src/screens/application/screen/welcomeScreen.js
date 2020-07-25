import React from 'react';
import { Text, Image, View, SafeAreaView } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { Icon, MainButton } from '../../../components';

import styles from './welcomeStyles';

const WelcomeScreen = ({ handleButtonPress }) => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        <Image
          style={{ width: 205, height: 200, alignSelf: 'center' }}
          source={require('../../../assets/ecency-logo.png')}
        />
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.ecencyText}>Ecency</Text>
        </View>
        <View style={styles.sectionRow}>
          <Icon
            iconType="SimpleLineIcons"
            name="question"
            color={EStyleSheet.value('$primaryBlue')}
            size={60}
          />
          <View>
            <Text style={styles.sectionTitle}>Are you looking for community?</Text>
            <Text style={styles.sectionText}>
              Are you getting censored by centralized social networks? Your privacy being violated,
              your data is being sold by cooporations?
            </Text>
          </View>
        </View>
        <View style={styles.sectionRow}>
          <Icon
            iconType="SimpleLineIcons"
            name="question"
            color={EStyleSheet.value('$primaryBlue')}
            size={60}
          />
          <View>
            <Text style={styles.sectionTitle}>We believe, we have a solution!</Text>
            <Text style={styles.sectionText}>
              Utilizing blockchain technology, we believe we have found a ways to create censorship
              free, decentralized and rewarding platform.
            </Text>
          </View>
        </View>
        <View style={styles.sectionRow}>
          <Icon
            iconType="SimpleLineIcons"
            name="question"
            color={EStyleSheet.value('$primaryBlue')}
            size={60}
          />
          <View>
            <Text style={styles.sectionTitle}>Join Ecency communities!</Text>
            <Text style={styles.sectionText}>
              Join/build community you own that nobody can shutdown or censor, get rewarded and
              reward others who contribute and share their experiences with community.
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
