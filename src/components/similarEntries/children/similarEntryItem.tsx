import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { catchPostImage } from '@ecency/render-helper';

import ROUTES from '../../../constants/routeNames';
import { getTimeFromNow } from '../../../utils/time';
import { Icon } from '../../icon';
import { HiddenImagePlaceholder } from '../../hiddenImagePlaceholder';
import { useImageReveal } from '../../../hooks/useImageReveal';
import styles from '../styles/similarEntries.styles';

interface SimilarEntry {
  author: string;
  permlink: string;
  title?: string;
  img_url?: string;
  created_at?: string;
}

interface Props {
  entry: SimilarEntry;
}

const SimilarEntryItem = ({ entry }: Props) => {
  const navigation = useNavigation();

  const thumbnail = useMemo(() => {
    if (!entry.img_url) return null;
    return catchPostImage(entry.img_url, 400, 200, 'match');
  }, [entry.img_url]);

  const { isHidden, reveal } = useImageReveal(thumbnail || undefined);

  const relativeDate = useMemo(
    () => (entry.created_at ? getTimeFromNow(entry.created_at) : ''),
    [entry.created_at],
  );

  const _onPress = () => {
    navigation.navigate({
      name: ROUTES.SCREENS.POST,
      params: {
        author: entry.author,
        permlink: entry.permlink,
      },
      key: `${entry.author}/${entry.permlink}`,
    } as never);
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={_onPress} style={styles.card}>
      {isHidden ? (
        <HiddenImagePlaceholder width="100%" height={100} onPress={reveal} />
      ) : thumbnail ? (
        <ExpoImage
          source={{ uri: thumbnail }}
          style={styles.image}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <Icon name="image" iconType="MaterialIcons" size={32} color="#999" />
        </View>
      )}
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {entry.title || ''}
        </Text>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.author}>
            @{entry.author}
          </Text>
          {!!relativeDate && <Text style={styles.date}>{relativeDate}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SimilarEntryItem;
