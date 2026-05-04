import React, { useState, useMemo, useCallback, memo, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useIntl } from 'react-intl';
import DatePicker from 'react-native-date-picker';
import { useDispatch } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import Animated, { SlideOutRight } from 'react-native-reanimated';
import styles from '../styles/pollsWizardContent.styles';
import { TextButton } from '../../buttons';
import { FormInput } from '../../formInput';
import type { FormInputHandle } from '../../formInput';
import { dateToFormatted } from '../../../utils/time';
import { PollConfig } from './pollConfig';
import { PollPreferredInterpretation } from '../../../providers/hive/hive.types';
import { removePollDraft, setPollDraftAction } from '../../../redux/actions/editorActions';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';
import { PollDraft } from '../../../providers/ecency/ecency.types';
import { useAppSelector } from '../../../hooks';
import { MainButton } from '../../mainButton';
import IconButton from '../../iconButton';

interface ChoiceRowProps {
  choice: string;
  index: number;
  placeholder: string;
  inputRef: (input: FormInputHandle | null) => void;
  onChange: (index: number, text: string) => void;
  onRemove: (index: number) => void;
}

const ChoiceRow = memo(
  ({ choice, index, placeholder, inputRef, onChange, onRemove }: ChoiceRowProps) => {
    const handleChange = useCallback((text: string) => onChange(index, text), [onChange, index]);
    const handleRemove = useCallback(() => onRemove(index), [onRemove, index]);

    return (
      <View style={styles.inputContainer}>
        <FormInput
          ref={inputRef}
          rightIconName="arrow-right"
          iconType="MaterialCommunityIcons"
          isValid={true}
          onChange={handleChange}
          placeholder={placeholder}
          isEditable={true}
          defaultValue={choice}
          wrapperStyle={styles.inputWrapper}
          inputStyle={styles.input}
        />
        {index > 1 && (
          <IconButton
            iconType="MaterialIcons"
            color={EStyleSheet.value('$iconColor')}
            size={24}
            name="close"
            style={styles.btnRemove}
            onPress={handleRemove}
          />
        )}
      </View>
    );
  },
);

const INIT_POLL_DRAFT: PollDraft = {
  title: '',
  choices: ['', ''],
  filters: {
    accountAge: 100,
  },
  interpretation: PollPreferredInterpretation.NUMBER_OF_VOTES,
  voteChange: false,
  hideVotes: false,
  hideResults: true,
  communityMembership: [],
  token: undefined,
  maxChoicesVoted: 1,
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // set to 7 days from now
};

const isPollDraftValid = (draft: PollDraft) =>
  !!draft.title && !draft.choices.some((item) => item === null || item === '');

export const PollsWizardContent = ({
  draftId,
  onClose,
}: {
  draftId?: string;
  onClose: () => void;
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  // const navigation = useNavigation();

  const pollDraftsMeta = useAppSelector((state) => state.editor.pollDraftsMap);
  const _pollAtttaced = draftId && pollDraftsMeta[draftId];

  const _initPollDraft = useMemo(
    () => (_pollAtttaced ? pollDraftsMeta[draftId] : INIT_POLL_DRAFT),
    [],
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [pollDraft, setPollDraft] = useState<PollDraft>(_initPollDraft);
  const nextChoiceKeyRef = useRef(_initPollDraft.choices.length);
  const pollDraftRef = useRef<PollDraft>(_initPollDraft);
  const questionInputRef = useRef<FormInputHandle>(null);
  const choiceInputRefs = useRef<Record<number, FormInputHandle | null>>({});
  const [choiceKeys, setChoiceKeys] = useState(() =>
    _initPollDraft.choices.map((_, index) => `poll-choice-${index}`),
  );
  const [isValid, setIsValid] = useState(() => isPollDraftValid(_initPollDraft));

  const expiryDateTime = new Date(pollDraft.endTime); // TOOD: adjust time formate to match with web
  const _mainBtnTitle = intl.formatMessage({
    id: _pollAtttaced ? 'post_poll.update_poll' : 'post_poll.attach_poll',
  });

  const updateValidity = useCallback((nextDraft: PollDraft) => {
    const nextIsValid = isPollDraftValid(nextDraft);
    setIsValid((prev) => (prev === nextIsValid ? prev : nextIsValid));
  }, []);

  const updatePollDraftRef = useCallback(
    (updater: (draft: PollDraft) => PollDraft) => {
      const nextDraft = updater(pollDraftRef.current);
      pollDraftRef.current = nextDraft;
      updateValidity(nextDraft);
      return nextDraft;
    },
    [updateValidity],
  );

  const updatePollDraftState = useCallback(
    (updater: PollDraft | ((draft: PollDraft) => PollDraft)) => {
      const nextDraft =
        typeof updater === 'function'
          ? (updater as (draft: PollDraft) => PollDraft)(pollDraftRef.current)
          : updater;
      pollDraftRef.current = nextDraft;
      setPollDraft(nextDraft);
      updateValidity(nextDraft);
    },
    [updateValidity],
  );

  const syncDraftState = useCallback(() => {
    setPollDraft(pollDraftRef.current);
  }, []);

  const addChoice = () => {
    const nextKey = `poll-choice-${nextChoiceKeyRef.current}`;
    nextChoiceKeyRef.current += 1;
    setChoiceKeys((prev) => [...prev, nextKey]);
    updatePollDraftState({
      ...pollDraftRef.current,
      choices: [...pollDraftRef.current.choices, ''],
    });
  };

  const _removeChoice = useCallback(
    (index: number) => {
      setChoiceKeys((prev) => prev.filter((_, choiceIndex) => choiceIndex !== index));
      updatePollDraftState((prev) => {
        const newChoices = [...prev.choices];
        newChoices.splice(index, 1);
        return { ...prev, choices: newChoices };
      });
    },
    [updatePollDraftState],
  );

  const handleChoiceChange = useCallback(
    (index: number, value: string) => {
      updatePollDraftRef((prev) => {
        const newChoices = [...prev.choices];
        newChoices[index] = value;
        return { ...prev, choices: newChoices };
      });
    },
    [updatePollDraftRef],
  );

  const createPoll = () => {
    // Implement poll creation logic here
    console.log('Poll created!');
    dispatch(setPollDraftAction(draftId || DEFAULT_USER_DRAFT_ID, pollDraftRef.current));
    // handle modal close
    onClose();
  };

  const resetPoll = () => {
    pollDraftRef.current = INIT_POLL_DRAFT;
    setPollDraft(INIT_POLL_DRAFT);
    nextChoiceKeyRef.current = INIT_POLL_DRAFT.choices.length;
    setChoiceKeys(INIT_POLL_DRAFT.choices.map((_, index) => `poll-choice-${index}`));
    updateValidity(INIT_POLL_DRAFT);
    questionInputRef.current?.setText(INIT_POLL_DRAFT.title);
    INIT_POLL_DRAFT.choices.forEach((choice, index) => {
      choiceInputRefs.current[index]?.setText(choice);
    });
    dispatch(removePollDraft(draftId || DEFAULT_USER_DRAFT_ID));
  };

  const _onQuestionChange = (text) => {
    updatePollDraftRef((prev) => ({
      ...prev,
      title: text,
    }));
  };

  const _onExpiryDateChange = (date: Date) => {
    updatePollDraftState({
      ...pollDraftRef.current,
      endTime: date.toISOString(),
    });
  };

  const _renderEndTime = () => {
    const _dateString = dateToFormatted(expiryDateTime.toISOString(), 'ddd  |  MMM DD  |  hh:mm A');
    return (
      <>
        <Text style={styles.label}>{intl.formatMessage({ id: 'post_poll.wizard_end_time' })}</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <FormInput
            rightIconName="clock"
            iconType="MaterialCommunityIcons"
            isEditable={false}
            value={_dateString}
            wrapperStyle={styles.inputWrapper}
            inputStyle={styles.input}
            pointerEvents="none"
          />
        </TouchableOpacity>
      </>
    );
  };

  const _renderConfig = () => {
    return (
      <>
        {!showConfig && (
          <Animated.View exiting={SlideOutRight}>
            <View style={styles.separator} />
            <TouchableOpacity
              onPress={() => {
                syncDraftState();
                setShowConfig(!showConfig);
              }}
            >
              <FormInput
                rightIconName="settings"
                iconType="MaterialIcons"
                isEditable={false}
                value={
                  showConfig
                    ? intl.formatMessage({ id: 'post_poll.wizard_collapse_config' })
                    : intl.formatMessage({ id: 'post_poll.wizard_expand_config' })
                }
                wrapperStyle={styles.inputWrapper}
                inputStyle={styles.input}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </Animated.View>
        )}
        {showConfig && <PollConfig pollDraft={pollDraft} setPollDraft={updatePollDraftState} />}
      </>
    );
  };

  const _renderChoiceInput = (choice: string, index: number) => (
    <ChoiceRow
      key={choiceKeys[index]}
      choice={choice}
      index={index}
      placeholder={intl.formatMessage(
        { id: 'post_poll.choice_placeholder' },
        { number: index + 1 },
      )}
      inputRef={(input) => {
        choiceInputRefs.current[index] = input;
      }}
      onChange={handleChoiceChange}
      onRemove={_removeChoice}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>{intl.formatMessage({ id: 'post_poll.poll_question' })}</Text>
        <FormInput
          ref={questionInputRef}
          rightIconName="progress-question"
          iconType="MaterialCommunityIcons"
          isValid={true}
          onChange={_onQuestionChange}
          placeholder={intl.formatMessage({
            id: 'post_poll.question_placeholder',
          })}
          isEditable
          defaultValue={pollDraft.title}
          wrapperStyle={styles.inputWrapper}
          inputStyle={styles.input}
        />

        <Text style={styles.label}>{intl.formatMessage({ id: 'post_poll.wizard_choices' })}</Text>
        {pollDraft.choices.map(_renderChoiceInput)}

        <TextButton
          text={intl.formatMessage({
            id: 'post_poll.add_choice',
          })}
          onPress={addChoice}
          textStyle={styles.addChoice}
        />

        {_renderEndTime()}
        {_renderConfig()}

        <View style={styles.actionPanel}>
          <MainButton
            style={styles.btnMain}
            text={_mainBtnTitle}
            isDisable={!isValid}
            onPress={createPoll}
          />
          <TextButton
            textStyle={styles.btnReset}
            text={intl.formatMessage({ id: 'post_poll.wizard_reset' })}
            onPress={resetPoll}
          />
        </View>
      </ScrollView>

      <DatePicker
        type="datetime"
        modal={true}
        minimumDate={new Date()}
        date={new Date(pollDraft.endTime)}
        open={showDatePicker}
        onConfirm={(date) => {
          _onExpiryDateChange(date);
          setShowDatePicker(false);
        }}
        onCancel={() => {
          setShowDatePicker(false);
        }}
      />
    </View>
  );
};
