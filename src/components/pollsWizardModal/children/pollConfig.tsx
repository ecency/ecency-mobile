import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet from 'react-native-actions-sheet';
import styles from '../styles/pollConfig.styles';
import { FormInput } from '../../formInput';
import SettingsItem from '../../settingsItem';
import { PollPreferredInterpretation } from '../../../providers/hive/hive.types';
import { PollDraft } from '../../../providers/ecency/ecency.types';

interface Props {
  pollDraft: PollDraft;
  setPollDraft: (meta: PollDraft) => void;
}

export const PollConfig = forwardRef(({ pollDraft, setPollDraft }: Props, ref) => {
  const intl = useIntl();
  const sheetModalRef = useRef(null);

  const _interpretations = Object.values(PollPreferredInterpretation);

  useImperativeHandle(ref, () => ({
    showConfig: () => {
      sheetModalRef.current?.show();
    },
  }));

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

  const _renderFormContent = (
    <View style={styles.optionsContainer}>
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
  );

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      closeOnTouchBackdrop={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.sheetIndicator}
    >
      {_renderFormContent}
    </ActionSheet>
  );
});
