import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bar as ProgressBar } from 'react-native-progress';
import styles from '../styles/pollChoices.styles';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import EStyleSheet from 'react-native-extended-stylesheet';
import { PollChoice, PollVoter } from '../../../providers/polls/polls.types';
import { mapMetaChoicesToPollChoices } from '../../../providers/polls/converters';
import { CheckBox } from '../../checkbox';
import { PostMetadata } from '../../../providers/hive/hive.types';

interface PollChoicesProps {
  loading: boolean;
  metadata: PostMetadata;
  choices?: PollChoice[];
  userVote?: PollVoter;
  handleCastVote: (optionNum: number) => void;
}

enum Modes {
  LOADING = 0,
  SELECT = 1,
  RESULT = 2,
}

export const PollChoices = ({ choices, metadata, userVote, loading, handleCastVote }: PollChoicesProps) => {

  const [mode, setMode] = useState(Modes.LOADING)
  const [_choices, setChoices] = useState(
    choices || mapMetaChoicesToPollChoices(metadata.choices));

  const totalVotes = useMemo(
    () => _choices.reduce(
      (prevVal, option) => prevVal + (option?.votes?.total_votes) || 0, 0)
    , [_choices]);

  const _hideVotes = useMemo(() => metadata.hide_votes && !userVote, [metadata, userVote]);
  const _voteDisabled = useMemo(() => metadata.vote_change !== undefined
    ? !metadata.vote_change && !!userVote
    : false, [metadata, userVote]);

  useEffect(() => {
    if (!loading && !!choices) {
      setChoices(choices)
      setMode(Modes.RESULT)
    }
  }, [loading, choices])



  const _renderProgressBar = (option: PollChoice, isSelected: boolean) => {
    // Dummy data for now, replace with real dat
    const votes = option.votes?.total_votes || 0;
    const percentage = (!_hideVotes && !!totalVotes) ? (votes / totalVotes) * 100 : 0; //TODO: adjust logic here
    const _barWidth = getWindowDimensions().width - 64;

    console.log('percentage to render', percentage, votes, totalVotes);

    return (
      <View style={styles.choiceWrapper}>
        <View>
          <ProgressBar
            progress={_hideVotes ? 0 : percentage / 100} width={_barWidth} height={40}
            style={styles.progressBar}
            unfilledColor={EStyleSheet.value("$primaryLightBackground")}
            color={EStyleSheet.value("$iconColor")}
            indeterminate={mode === Modes.LOADING}
            useNativeDriver={true}
          />
          <View style={styles.progressContentWrapper}>
            <View style={styles.choiceLabelWrapper}>
              <CheckBox locked isChecked={isSelected} />
              <Text style={styles.label}>{option.choice_text}</Text>
            </View>
            {!_hideVotes &&
              <Text style={styles.count}>{`${votes} voted`}</Text>
            }

          </View>
        </View>
      </View>
    );
  };


  const renderOptions = () => {
    return _choices.map((option, index) => {
      const _isSelected = userVote?.choice_num === option.choice_num
      const _disabled = loading || _voteDisabled || _isSelected
      return (
        <TouchableOpacity key={index} disabled={_disabled} onPress={() => handleCastVote(option.choice_num)}>
          <View style={{ marginVertical: 5 }}>
            {_renderProgressBar(option, _isSelected)}
          </View>
        </TouchableOpacity>
      );
    });
  };



  return (
    <View>
      {renderOptions()}
    </View>
  );
};
