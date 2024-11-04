import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Bar as ProgressBar } from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { get } from 'lodash';
import styles from '../styles/pollChoices.styles';
import { PollChoice, PollVoter } from '../../../providers/polls/polls.types';
import { mapMetaChoicesToPollChoices } from '../../../providers/polls/converters';
import { CheckBox } from '../../checkbox';
import { PostMetadata } from '../../../providers/hive/hive.types';
import { PollModes } from '../container/postPoll';
import { TextButton } from '../../buttons';

interface PollChoicesProps {
  loading: boolean;
  metadata: PostMetadata;
  choices?: PollChoice[];
  userVote?: PollVoter;
  mode: PollModes;
  selection: number[];
  voteDisabled: boolean;
  hideVoters: boolean;
  interpretationToken?: boolean;
  compactView?: boolean;
  handleChoiceSelect: (optionNum: number) => void;
  handleVotersPress: (optionNum: number) => void;
}

export const PollChoices = ({
  choices,
  metadata,
  userVote,
  mode,
  loading,
  selection,
  voteDisabled,
  hideVoters,
  interpretationToken,
  compactView,
  handleChoiceSelect,
  handleVotersPress,
}: PollChoicesProps) => {
  const intl = useIntl();
  const dim = useWindowDimensions();

  const [_choices, setChoices] = useState(choices || mapMetaChoicesToPollChoices(metadata.choices));

  const totalVotes = useMemo(
    () =>
      _choices.reduce(
        (prevVal, option) =>
          prevVal +
          get(option.votes, interpretationToken ? 'hive_hp_incl_proxied' : 'total_votes', 0),
        0,
      ),
    [_choices, interpretationToken],
  );

  useEffect(() => {
    if (!loading && !!choices) {
      setChoices(choices);
    }
  }, [loading, choices]);

  const _isModeSelect = mode !== PollModes.RESULT;

  const _handleChoiceSelect = (choiceNum: number) => {
    handleChoiceSelect(choiceNum);
  };

  const _renderProgressBar = (option: PollChoice) => {
    const _isVoted =
      !_isModeSelect && userVote?.choices && userVote.choices.includes(option.choice_num);
    const _isSelected = selection.includes(option.choice_num);

    const votes =
      Math.round(
        get(option.votes, interpretationToken ? 'hive_hp_incl_proxied' : 'total_votes', 0) * 1000,
      ) / 1000;

    const percentage = !_isModeSelect && !!totalVotes ? (votes / totalVotes) * 100 : 0; // TODO: adjust logic here
    const _barWidth = dim.width - (compactView ? 72 : 64);

    const _barStyle = [
      styles.progressBar,
      compactView && styles.progressBarCompact,
      { borderColor: EStyleSheet.value(_isSelected ? '$primaryBlue' : 'transparent') },
    ];

    const _onVotersPress = () => {
      handleVotersPress(option.choice_num);
    };

    return (
      <View style={styles.choiceWrapper}>
        <View>
          <ProgressBar
            progress={_isModeSelect ? 0 : percentage / 100}
            width={_barWidth}
            height={compactView ? 32 : 40}
            style={_barStyle}
            unfilledColor={EStyleSheet.value('$primaryLightBackground')}
            color={EStyleSheet.value(_isVoted ? '$primaryLightBlue2' : '$darkIconColor')}
            indeterminate={mode === PollModes.LOADING}
            useNativeDriver={true}
          />
          <View style={styles.progressContentWrapper}>
            <View style={styles.choiceLabelWrapper}>
              <CheckBox
                locked
                isChecked={_isVoted}
                isRound={true}
                style={styles.checkContainerStyle}
              />
              <Text numberOfLines={compactView ? 1 : 2} style={styles.label}>
                {option.choice_text}
              </Text>
            </View>
            {!_isModeSelect && (
              <TextButton
                disabled={hideVoters}
                textStyle={styles.count}
                text={`${votes} ${intl.formatMessage({
                  id: interpretationToken ? 'post_poll.hp' : 'post_poll.voted',
                })}`}
                onPress={_onVotersPress}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderOptions = () => {
    return _choices.map((option, index) => {
      return (
        <TouchableOpacity
          // eslint-disable-next-line react/no-array-index-key
          key={`key_${index}`}
          disabled={voteDisabled}
          onPress={() => _handleChoiceSelect(option.choice_num)}
        >
          <View style={{ marginVertical: 5 }}>{_renderProgressBar(option)}</View>
        </TouchableOpacity>
      );
    });
  };

  return <View>{renderOptions()}</View>;
};
