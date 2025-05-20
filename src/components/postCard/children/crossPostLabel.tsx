import React from 'react';
import { View, Text, TextStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { PostCardActionIds } from '../container/postCard';
import Icon from '../../icon';
import ROUTES from '../../../constants/routeNames';
import styles from '../styles/children.styles';
import { getCommunityTitle } from '../../../providers/hive/dhive';

interface CrossPostLabelProps {
  crosspostMeta: {
    author: string;
    community: string;
  };
  handleCardInteraction: (id: PostCardActionIds, payload?: any) => void;
}

const CrossPostLabel: React.FC<CrossPostLabelProps> = ({
  crosspostMeta,
  handleCardInteraction,
}) => {
  if (!crosspostMeta) {
    return null;
  }

  const intl = useIntl();

  const { author, community } = crosspostMeta;

  const [communityTitle, setCommunityTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunityTitle = async () => {
      try {
        if (!communityTitle) {
          const title = await getCommunityTitle(community);
          setCommunityTitle(title);
        }
      } catch (error) {
        console.error('Failed to fetch community title:', error);
      }
    };

    fetchCommunityTitle();
  }, [community]);

  const _handleOnTagPress = () => {
    handleCardInteraction(PostCardActionIds.NAVIGATE, {
      name: ROUTES.SCREENS.COMMUNITY,
      params: {
        tag: crosspostMeta.community,
      },
    });
  };

  const _handleOnUserPress = () => {
    handleCardInteraction(PostCardActionIds.USER, author);
  };

  const _highlightFontStyle: TextStyle = {
    fontWeight: '700',
    color: EStyleSheet.value('$primaryBlue'),
  };

  return (
    <View style={styles.crossPostWrapper}>
      <Icon
        iconType="MaterialIcons"
        name="repeat"
        size={16}
        color={EStyleSheet.value('$iconColor')}
        style={{ marginRight: 4 }}
      />

      <Text style={styles.repostText}>
        {intl.formatMessage(
          { id: 'post.cross_post' },
          {
            username: (
              <Text style={_highlightFontStyle} onPress={_handleOnUserPress}>
                {author}
              </Text>
            ),
            community: (
              <Text style={_highlightFontStyle} onPress={_handleOnTagPress}>
                {communityTitle || community}
              </Text>
            ),
          },
        )}
      </Text>
    </View>
  );
};

export default CrossPostLabel;
