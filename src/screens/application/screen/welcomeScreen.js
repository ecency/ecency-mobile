import React from 'react';
import { Text, Image, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { Icon, MainButton } from '../../../components';

import styles from './welcomeStyles';

const WelcomeScreen = ({ handleButtonPress }) => {
  return (
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
          <Text style={styles.sectionTitle}>Lorem ipsum dolor</Text>
          <Text style={styles.sectionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a tellus eget arcu
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
          <Text style={styles.sectionTitle}>Lorem ipsum dolor</Text>
          <Text style={styles.sectionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a tellus eget arcu
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
          <Text style={styles.sectionTitle}>Lorem ipsum dolor</Text>
          <Text style={styles.sectionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a tellus eget arcu
          </Text>
        </View>
      </View>
      <MainButton
        onPress={handleButtonPress}
        style={{ alignSelf: 'center', paddingHorizontal: 30 }}
        text="Start to Ecency"
      />
    </View>
  );
};

export default WelcomeScreen;
