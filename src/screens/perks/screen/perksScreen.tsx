import React from 'react';
import { ScrollView } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIntl } from 'react-intl';

import { BasicHeader } from '../../../components';
import QuestsCard from '../children/questsCard';
import SpendOptions from '../children/spendOptions';
import styles from '../styles/perksStyles';

const PerksScreen = gestureHandlerRootHOC(() => {
  const intl = useIntl();

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader title={intl.formatMessage({ id: 'perks.header' })} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <QuestsCard />
        <SpendOptions />
      </ScrollView>
    </SafeAreaView>
  );
});

export { PerksScreen as Perks };
