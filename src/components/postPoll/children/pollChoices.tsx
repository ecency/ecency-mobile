import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bar as ProgressBar } from 'react-native-progress';
import styles from '../styles/pollChoices.styles';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import EStyleSheet from 'react-native-extended-stylesheet';
import { PollChoice } from '../../../providers/polls/polls.types';
import { mapMetaChoicesToPollChoices } from '../../../providers/polls/converters';

interface PollChoicesProps {
  loading: boolean;
  metaChoices: string[]
  choices?: PollChoice[];
}

enum Modes {
  LOADING = 0,
  SELECT = 1,
  RESULT = 2,
}

const PollChoices = ({ choices, metaChoices, loading }: PollChoicesProps) => {

  const [mode, setMode] = useState(Modes.LOADING)
  const [_choices, setChoices] = useState(choices || mapMetaChoicesToPollChoices(metaChoices));

  const totalVotes = useMemo(
    () => _choices.reduce(
      (prevVal, option) => prevVal + (option?.votes?.total_votes) || 0, 0)
      , [_choices])

  useEffect(() => {
    if (!loading && !!choices) {
      setChoices(choices)
      setMode(Modes.RESULT)
    }
  }, [loading, choices])


  const castVote = (id: number) => {
    // Logic to handle voting
    console.log("Voted for:", id);
  };


  const _renderProgressBar = (option: PollChoice) => {
    // Dummy data for now, replace with real dat
    const votes = option.votes?.total_votes || 0;
    const percentage = totalVotes ? (votes / totalVotes) * 100 : 0;
    const _barWidth = getWindowDimensions().width - 64;

    console.log('percentage to render', percentage, votes, totalVotes);

    return (
      <View>

        <View>
          <ProgressBar
            progress={percentage / 100} width={_barWidth} height={44}
            style={styles.progressBar}
            unfilledColor={EStyleSheet.value("$primaryLightBackground")}
            color={EStyleSheet.value("$iconColor")}
            indeterminate={mode === Modes.LOADING}
            useNativeDriver={true}
          />
          <View style={styles.optionsTextWrapper}>
            <Text style={styles.label}>{option.choice_text}</Text>
          </View>
        </View>
        <Text style={styles.count}>{`${votes} votes (${percentage.toFixed(2)}%)`}</Text>
      </View>
    );
  };


  const renderOptions = () => {
    return _choices.map((option, index) => {
      return (
        <TouchableOpacity key={index} onPress={() => castVote(option.choice_num)}>
          <View style={{ marginVertical: 5 }}>
            {_renderProgressBar(option)}
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

export default PollChoices;