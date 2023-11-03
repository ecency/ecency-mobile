import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Progress from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import styles from './quickProfileStyles';
import { UserAvatar } from '../../..';

interface Props {
  username: string;
  about: string;
  created: {
    unit: string;
    value: number;
  };
  votingPower: string;
  isLoading: boolean;
  onPress: () => void;
}

export const ProfileBasic = ({
  username,
  about,
  votingPower,
  isLoading,
  created,
  onPress,
}: Props) => {
  const intl = useIntl();
  const progress = parseInt(votingPower || '0') / 100;

  let joinedString = '---';
  if (created) {
    const timeString = `${-created.value} ${intl.formatMessage({ id: `time.${created.unit}` })}`;
    joinedString = intl.formatMessage({ id: 'profile.joined' }, { time: timeString });
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View>
          <UserAvatar username={username} disableSize={true} noAction style={styles.image} />
          <View style={styles.progressCircle}>
            <Progress.Circle
              size={144}
              indeterminate={isLoading}
              progress={progress}
              borderColor="gray"
              borderWidth={0}
              thickness={8}
              strokeCap="round"
              color={EStyleSheet.value('$primaryBlue')}
            />
          </View>
        </View>

        <Text style={styles.title}>{`@${username}`}</Text>
        {!!about && (
          <Text style={styles.bodyText} numberOfLines={2}>
            {about}
          </Text>
        )}
        <Text style={styles.bodyText}>{joinedString}</Text>
      </View>
    </TouchableOpacity>
  );
};
