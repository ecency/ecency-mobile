import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';

import { Icon } from '../../../components';
import RootNavigation, { NavigateOptions } from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';
import styles from '../styles/perksStyles';

// `nav` is a whole NavigateOptions rather than a route plus loose params, so each entry's
// params are checked against its own destination right here in the literal.
const OPTIONS: { id: string; icon: string; nav: NavigateOptions }[] = [
  { id: 'spin', icon: 'gift-outline', nav: { name: ROUTES.SCREENS.SPIN_GAME } },
  {
    id: 'boost_plus',
    icon: 'fire',
    nav: { name: ROUTES.SCREENS.REDEEM, params: { redeemType: 'boost_plus' } },
  },
  {
    id: 'rc_topup',
    icon: 'lightning-bolt',
    nav: { name: ROUTES.SCREENS.REDEEM, params: { redeemType: 'rc_topup' } },
  },
  {
    id: 'promote',
    icon: 'bullhorn-outline',
    nav: { name: ROUTES.SCREENS.REDEEM, params: { redeemType: 'promote' } },
  },
  {
    id: 'account_boost',
    icon: 'rocket-launch-outline',
    nav: { name: ROUTES.SCREENS.ACCOUNT_BOOST },
  },
];

const SpendOptions = () => {
  const intl = useIntl();

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{intl.formatMessage({ id: 'perks.spend_title' })}</Text>
      {OPTIONS.map((opt, index) => (
        <TouchableOpacity
          key={opt.id}
          style={[styles.spendRow, index === OPTIONS.length - 1 && { borderBottomWidth: 0 }]}
          onPress={() => RootNavigation.navigate(opt.nav)}
        >
          <View style={styles.iconWrap}>
            <Icon
              iconType="MaterialCommunityIcons"
              name={opt.icon}
              size={18}
              color={EStyleSheet.value('$primaryBlue')}
            />
          </View>
          <View style={styles.spendBody}>
            <Text style={styles.spendTitle}>{intl.formatMessage({ id: `perks.${opt.id}` })}</Text>
            <Text style={styles.spendDesc}>
              {intl.formatMessage({ id: `perks.${opt.id}_desc` })}
            </Text>
          </View>
          <Icon
            iconType="MaterialIcons"
            name="chevron-right"
            size={22}
            color={EStyleSheet.value('$iconColor')}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SpendOptions;
