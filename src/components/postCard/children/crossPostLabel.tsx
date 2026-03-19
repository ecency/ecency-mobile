import React, { useState, useEffect } from 'react';
import { View, Text, TextStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { getCommunityQueryOptions } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import { PostCardActionIds } from '../container/postCard';
import Icon from '../../icon';
import ROUTES from '../../../constants/routeNames';
import styles from '../styles/children.styles';

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
  const queryClient = useQueryClient();

  const { author, community } = crosspostMeta;

  const [communityTitle, setCommunityTitle] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunityTitle = async () => {
      try {
        if (!communityTitle && community) {
          const communityData = await queryClient.fetchQuery(
            getCommunityQueryOptions(community, ''),
          );
          const title = communityData?.title || community;
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
