import React, { useRef } from 'react';
import { Text } from 'react-native';
import { useIntl } from 'react-intl';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import styles from '../styles/pollsWizardContent.styles';
import { FormInput } from '../../formInput';
import type { FormInputHandle } from '../../formInput';
import SettingsItem from '../../settingsItem';
import { PollPreferredInterpretation } from '../../../providers/hive/hive.types';
import { PollDraft } from '../../../providers/ecency/ecency.types';

interface Props {
  pollDraft: PollDraft;
  setPollDraft: (meta: PollDraft | ((draft: PollDraft) => PollDraft)) => void;
}

export const PollConfig = ({ pollDraft, setPollDraft }: Props) => {
  const intl = useIntl();
  const _interpretations = Object.values(PollPreferredInterpretation);
  const ageInputRef = useRef<FormInputHandle>(null);
  const maxOptionsInputRef = useRef<FormInputHandle>(null);

  const _onAgeLimitChange = (text) => {
    const val = parseInt(text);
    if (val >= 0) {
      const sanitized = `${val}`;
      if (sanitized !== text) {
        ageInputRef.current?.setText(sanitized);
      }
      setPollDraft((prev) => ({
        ...prev,
        filters: {
          accountAge: val,
        },
      }));
    } else {
      // Reject non-numeric or negative input by re-feeding last known good value
      ageInputRef.current?.setText(`${pollDraft.filters?.accountAge ?? ''}`);
    }
  };

  const _onMaxOptionsChange = (text) => {
    const val = parseInt(text);
    if (val >= 0) {
      const sanitized = `${val}`;
      if (sanitized !== text) {
        maxOptionsInputRef.current?.setText(sanitized);
      }
      setPollDraft((prev) => ({
        ...prev,
        maxChoicesVoted: val,
      }));
    } else {
      maxOptionsInputRef.current?.setText(`${pollDraft.maxChoicesVoted ?? ''}`);
    }
  };

  const _onInterpretationChange = (index: number) => {
    const interpretation = _interpretations[index];

    // TODO: handle token selection later
    const token = interpretation === PollPreferredInterpretation.TOKENS ? 'HIVE:HP' : undefined;

    setPollDraft((prev) => ({
      ...prev,
      interpretation,
      token,
    }));
  };

  const _onShowVotesChange = (val: boolean) => {
    setPollDraft((prev) => ({
      ...prev,
      hideVotes: !val,
    }));
  };

  const _onVoteChangeUpdate = (val: boolean) => {
    setPollDraft((prev) => ({
      ...prev,
      voteChange: val,
    }));
  };

  const _onHideResultsChange = (val: boolean) => {
    setPollDraft((prev) => ({
      ...prev,
      hideResults: val,
    }));
  };

  return (
    <Animated.View entering={SlideInDown} exiting={SlideOutDown}>
      <Text style={styles.label}>{intl.formatMessage({ id: 'post_poll.config_age' })}</Text>
      <FormInput
        ref={ageInputRef}
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
        ref={maxOptionsInputRef}
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
    </Animated.View>
  );
};
