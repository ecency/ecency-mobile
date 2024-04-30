import React, { Fragment, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bar as ProgressBar } from 'react-native-progress';
import styles from '../styles/pollChoices.styles';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import EStyleSheet from 'react-native-extended-stylesheet';

interface PollChoicesProps {
  choices: string[];
}

enum Mode {
  SELECT = 0,
  RESULT = 1,
}

const PollChoices = ({ choices }: PollChoicesProps) => {

  const [mode, setMode] = useState(Mode.RESULT)


  const _renderProgressBar = (option: string) => {
    // Dummy data for now, replace with real data
    const votes = 10; // Fetch the votes for this option from your data
    const totalVotes = 30; // Fetch the total votes from your data
    const percentage = (votes / totalVotes) * 100;
    const _barWidth = getWindowDimensions().width - 64;

    return (
      <View>
        
        <View>
          <ProgressBar
            progress={0.3} width={_barWidth} height={44}
            style={styles.progressBar}
            unfilledColor={EStyleSheet.value("$primaryLightBackground")}
            color={EStyleSheet.value("$iconColor")}
          />
          <View style={styles.optionsTextWrapper}>
            <Text style={styles.label}>{option}</Text>
          </View>
        </View>
        <Text style={styles.count}>{`${votes} votes (${percentage.toFixed(2)}%)`}</Text>
      </View>
    );
  };


  const renderOptions = () => {
    return choices.map((option, index) => {
      return (
        <TouchableOpacity key={index} onPress={() => castVote(option)}>
          <View style={{ marginVertical: 5 }}>
            {_renderProgressBar(option)}
          </View>
        </TouchableOpacity>
      );
    });
  };

  const castVote = (option: string) => {
    // Logic to handle voting
    console.log("Voted for:", option);
  };

  return (
    <View>
      {renderOptions()}
    </View>
  );
};

export default PollChoices;