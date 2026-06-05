import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useQuery } from '@tanstack/react-query';
import { getSpotlightsQueryOptions } from '@ecency/sdk';
import styles from '../styles/FeatureSpotlightCard.styles';
import { MainButton } from '../../mainButton';
import { TextButton } from '../../buttons';
import { useAppSelector, useLinkProcessor } from '../../../hooks';
import { updateSpotlightMeta } from '../../../redux/actions/cacheActions';
import { selectCurrentAccount } from '../../../redux/selectors';
import { getPostUrl } from '../../../utils/post';

export const FeatureSpotlightCard = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const linkProcessor = useLinkProcessor();

  const currentAccount = useAppSelector(selectCurrentAccount);
  const spotlightMeta = useAppSelector((state) => state.cache.spotlightMeta);

  // The /private-api/spotlights endpoint is anonymous, so no access token is needed.
  const spotlightsQuery = useQuery(getSpotlightsQueryOptions());

  // Apply the client-side rules the server leaves to clients: platform (mobile),
  // audience (logged-in by default; guestsOnly shows to signed-out visitors), and per-id
  // dismissal; then pick the highest weight (tie-break: earliest start). `path` is a
  // web-routing concept and is ignored here.
  const spotlight = useMemo(() => {
    const username = currentAccount?.name;
    const candidates = (spotlightsQuery.data ?? [])
      .filter((s) => !s.platforms || s.platforms.includes('mobile'))
      .filter((s) => (s.guestsOnly ? !username : !!username))
      .filter((s) => !spotlightMeta?.[`${s.id}_${username || 'guest'}`]?.dismissed);

    if (candidates.length === 0) {
      return null;
    }

    return candidates.reduce((best, s) => {
      const bestWeight = best.weight ?? 0;
      const weight = s.weight ?? 0;
      if (weight !== bestWeight) {
        return weight > bestWeight ? s : best;
      }
      const bestStart = best.start ? new Date(best.start).getTime() : 0;
      const start = s.start ? new Date(s.start).getTime() : 0;
      return start < bestStart ? s : best;
    });
  }, [spotlightsQuery.data, currentAccount?.name, spotlightMeta]);

  if (!spotlight) {
    return null;
  }

  const copy = spotlight.locales?.[intl.locale] ?? spotlight;
  const metaId = `${spotlight.id}_${currentAccount?.name || 'guest'}`;

  const _dismiss = () => {
    dispatch(updateSpotlightMeta(metaId, true));
  };

  const _action = () => {
    // Tapping the CTA counts as engagement, so always dismiss. `button_link` is a
    // required field, so a link is always present to open.
    const link = spotlight.button_link;
    if (link) {
      const url = /^https?:\/\//.test(link) ? link : getPostUrl(link);
      linkProcessor.handleLink(url);
    }
    _dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.body}>
          <Text style={styles.label}>{intl.formatMessage({ id: 'feature.spotlight.label' })}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.description}>{copy.description}</Text>
        </View>
      </View>
      <View style={styles.actionPanel}>
        <MainButton onPress={_action} style={styles.actionBtn} text={copy.button_text} />
        <TextButton
          onPress={_dismiss}
          style={styles.dismissBtn}
          text={intl.formatMessage({ id: 'feature.spotlight.dismiss' })}
        />
      </View>
    </View>
  );
};
