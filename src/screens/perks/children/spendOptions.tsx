import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';

import { Icon } from '../../../components';
import RootNavigation, { NavigateOptions } from '../../../navigation/rootNavigation';
import { AppParamList, RouteName } from '../../../navigation/types';
import ROUTES from '../../../constants/routeNames';
import styles from '../styles/perksStyles';

const OPTIONS: { id: string; icon: string; route: RouteName; params?: any }[] = [
  { id: 'spin', icon: 'gift-outline', route: ROUTES.SCREENS.SPIN_GAME },
  {
    id: 'boost_plus',
    icon: 'fire',
    route: ROUTES.SCREENS.REDEEM,
    params: { redeemType: 'boost_plus' },
  },
  {
    id: 'rc_topup',
    icon: 'lightning-bolt',
    route: ROUTES.SCREENS.REDEEM,
    params: { redeemType: 'rc_topup' },
  },
  {
    id: 'promote',
    icon: 'bullhorn-outline',
    route: ROUTES.SCREENS.REDEEM,
    params: { redeemType: 'promote' },
  },
  { id: 'account_boost', icon: 'rocket-launch-outline', route: ROUTES.SCREENS.ACCOUNT_BOOST },
];

const SpendOptions = () => {
  const intl = useIntl();

  const _navigate = <K extends RouteName>(route: K, params?: AppParamList[K]) => {
    // Correlated by the generic at the call site; TS cannot re-derive that pairing here.
    RootNavigation.navigate({ name: route, params } as NavigateOptions);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{intl.formatMessage({ id: 'perks.spend_title' })}</Text>
      {OPTIONS.map((opt, index) => (
        <TouchableOpacity
          key={opt.id}
          style={[styles.spendRow, index === OPTIONS.length - 1 && { borderBottomWidth: 0 }]}
          onPress={() => _navigate(opt.route, opt.params)}
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
