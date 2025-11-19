import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import styles from '../styles/pollConfig.styles';
import { FormInput } from '../../formInput';
import SettingsItem from '../../settingsItem';
import { PollPreferredInterpretation } from '../../../providers/hive/hive.types';
import { PollDraft } from '../../../providers/ecency/ecency.types';

interface Props {
  pollDraft: PollDraft;
  setPollDraft: (meta: PollDraft) => void;
  show: boolean;
}

export const PollConfig = ({ pollDraft, setPollDraft, show }: Props) => {
  const intl = useIntl();
  const _interpretations = Object.values(PollPreferredInterpretation);
  const [contentHeight, setContentHeight] = useState(0);

  const maxHeight = useSharedValue(show ? 10000 : 0);
  const opacity = useSharedValue(show ? 1 : 0);

  useEffect(() => {
    if (contentHeight > 0) {
      maxHeight.value = withTiming(show ? contentHeight : 0, {
        duration: 300,
      });
      opacity.value = withTiming(show ? 1 : 0, {
        duration: 300,
      });
    } else if (show) {
      // If showing but not measured yet, allow content to render with large maxHeight
      maxHeight.value = 10000;
      opacity.value = 1;
    }
  }, [show, contentHeight]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      maxHeight: maxHeight.value,
      opacity: opacity.value,
    };
  });

  const _onLayout = (event: { nativeEvent: { layout: { height: number } } }) => {
    const { height: layoutHeight } = event.nativeEvent.layout;
    if (layoutHeight > 0 && contentHeight === 0) {
      setContentHeight(layoutHeight);
      // Set initial animation values
      if (show) {
        maxHeight.value = layoutHeight;
        opacity.value = 1;
      } else {
        maxHeight.value = 0;
        opacity.value = 0;
      }
    }
  };

  const _onAgeLimitChange = (text) => {
    const val = parseInt(text);
    if (val >= 0) {
      setPollDraft({
        ...pollDraft,
        filters: {
          accountAge: val,
        },
      });
    }
  };

  const _onMaxOptionsChange = (text) => {
    const val = parseInt(text);
    if (val >= 0) {
      setPollDraft({
        ...pollDraft,
        maxChoicesVoted: val,
      });
    }
  };

  const _onInterpretationChange = (index: number) => {
    const interpretation = _interpretations[index];

    // TODO: handle token selection later
    const token = interpretation === PollPreferredInterpretation.TOKENS ? 'HIVE:HP' : undefined;

    setPollDraft({
      ...pollDraft,
      interpretation,
      token,
    });
  };

  const _onShowVotesChange = (val: boolean) => {
    setPollDraft({
      ...pollDraft,
      hideVotes: !val,
    });
  };

  const _onVoteChangeUpdate = (val: boolean) => {
    setPollDraft({
      ...pollDraft,
      voteChange: val,
    });
  };

  const _onHideResultsChange = (val: boolean) => {
    setPollDraft({
      ...pollDraft,
      hideResults: val,
    });
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          overflow: 'hidden',
        },
      ]}
    >
      <View onLayout={_onLayout} style={styles.optionsContainer}>
        <Text style={styles.label}>{intl.formatMessage({ id: 'post_poll.config_age' })}</Text>
        <FormInput
          rightIconName="calendar"
          iconType="MaterialCommunityIcons"
          isValid={true}
          onChange={_onAgeLimitChange}
          placeholder="minimum account age, default is 100"
          isEditable
          value={`${pollDraft.filters?.accountAge}`}
          wrapperStyle={styles.inputWrapper}
          inputStyle={styles.input}
          keyboardType="numeric"
        />

        {/** TODO: use translated text */}
        <Text style={styles.label}>{intl.formatMessage({ id: 'post_poll.config_max_options' })}</Text>
        <FormInput
          rightIconName="check-all"
          iconType="MaterialCommunityIcons"
          isValid={true}
          onChange={_onMaxOptionsChange}
          placeholder="minimum account age, default is 100"
          isEditable
          value={`${pollDraft.maxChoicesVoted}`}
          wrapperStyle={styles.inputWrapper}
          inputStyle={styles.input}
          keyboardType="numeric"
        />

        <SettingsItem
          title={intl.formatMessage({ id: 'post_poll.config_poll_interpretation' })}
          titleStyle={styles.settingsTitle}
          type="dropdown"
          actionType="language"
          options={_interpretations.map((id) =>
            intl.formatMessage({
              id: `post_poll.${id}`,
            }),
          )}
          selectedOptionIndex={_interpretations.indexOf(pollDraft.interpretation)}
          handleOnChange={_onInterpretationChange}
          wrapperStyle={styles.settingsWrapper}
        />

        <SettingsItem
          title={intl.formatMessage({ id: 'post_poll.config_hide_results' })}
          text="show more votes"
          type="toggle"
          actionType="show_votes"
          titleStyle={styles.settingsTitle}
          wrapperStyle={styles.settingsWrapper}
          handleOnChange={_onHideResultsChange}
          isOn={pollDraft.hideResults}
        />

        <SettingsItem
          title={intl.formatMessage({ id: 'post_poll.config_show_voters' })}
          text="show more votes"
          type="toggle"
          actionType="show_votes"
          titleStyle={styles.settingsTitle}
          wrapperStyle={styles.settingsWrapper}
          handleOnChange={_onShowVotesChange}
          isOn={!pollDraft.hideVotes}
        />

        <SettingsItem
          title={intl.formatMessage({ id: 'post_poll.config_vote_change' })}
          text="show more votes"
          type="toggle"
          actionType="show_votes"
          titleStyle={styles.settingsTitle}
          wrapperStyle={styles.settingsWrapper}
          handleOnChange={_onVoteChangeUpdate}
          isOn={pollDraft.voteChange}
        />
      </View>
    </Animated.View>
  );
};
