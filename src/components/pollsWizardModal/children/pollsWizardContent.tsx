import React, { useState, useRef, useMemo } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import styles from '../styles/pollsWizardContent.styles';
import { useIntl } from 'react-intl';
import { TextButton } from '../../buttons';
import { FormInput } from '../../formInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import DatePicker from 'react-native-date-picker';
import { dateToFormatted } from '../../../utils/time';
import { PollConfig } from './pollConfig';
import { PollMetadata, PollPreferredInterpretation } from '../../../providers/hive/hive.types';
import { useDispatch } from 'react-redux';
import { setPollDraftAction } from '../../../redux/actions/editorActions';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';
import { PollDraft } from '../../../providers/ecency/ecency.types';
import { useSelector } from 'react-redux';
import { useAppSelector } from '../../../hooks';

const INIT_POLL_DRAFT: PollDraft = {
    title: '',
    choices: ['', ''],
    filters: {
        accountAge: 100,
    },
    interpretation: PollPreferredInterpretation.NUMBER_OF_VOTES,
    voteChange: false,
    hideVotes: false,
    maxChoicesVoted: 1,
    endTime: new Date().toISOString()
}


export const PollsWizardContent = ({ draftId }: { draftId?: string }) => {
    const intl = useIntl();
    const dispatch = useDispatch();

    const pollConfigRef = useRef<typeof PollConfig>(null);

    const pollDraftsMeta = useAppSelector(state => state.editor.pollDraftsMap);

    const _initPollDraft = useMemo(() => draftId && pollDraftsMeta[draftId]
        ? pollDraftsMeta[draftId] : INIT_POLL_DRAFT,
        [])

    const [showDatePicker, setShowDatePicker] = useState(false);


    const [pollDraft, setPollDraft] = useState<PollDraft>(_initPollDraft)

    const expiryDateTime = new Date(pollDraft.endTime) //TOOD: adjust time formate to match with web

    const addChoice = () => {
        // setChoices([...choices, '']);
        setPollDraft({
            ...pollDraft,
            choices: [
                ...pollDraft.choices,
                ''
            ]
        })
    };

    const handleChoiceChange = (index, value) => {
        const newChoices = [...pollDraft.choices];
        newChoices[index] = value;
        setPollDraft({
            ...pollDraft,
            choices: newChoices
        });
    };

    const createPoll = () => {
        // Implement poll creation logic here
        console.log('Poll created!');
        dispatch(setPollDraftAction(draftId || DEFAULT_USER_DRAFT_ID, pollDraft))

    };

    const resetPoll = () => {
        setPollDraft(INIT_POLL_DRAFT)
    }


    const _onQuestionChange = (text) => {
        setPollDraft({
            ...pollDraft,
            title: text
        })
    }

    const _onExpiryDateChange = (date: Date) => {
        //TODO: add past and present checks
        setPollDraft({
            ...pollDraft,
            endTime: date.toISOString()
        })
    }


    const _renderEndTime = () => {
        const _dateString = dateToFormatted(expiryDateTime.toISOString(), 'ddd  |  MMM DD  |  hh:mm A')
        return (
            <>
                <Text style={styles.label}>End Time</Text>
                <TouchableOpacity onPress={() => { setShowDatePicker(true) }} >
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
        )


    }


    const _renderConfig = () => {
        return (
            <>
                <Text style={styles.label}>Configuration</Text>
                <TouchableOpacity onPress={() => { pollConfigRef.current?.showConfig() }} >
                    <FormInput
                        rightIconName="settings"
                        iconType="MaterialIcons"
                        isEditable={false}
                        value={"Age  |  Visibility  |  Interpretation"}
                        wrapperStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        pointerEvents="none"
                    />
                </TouchableOpacity>
            </>
        )
    }




    const _renderChoiceInput = (choice, index) => (
        <FormInput
            rightIconName="arrow-right"
            iconType="MaterialCommunityIcons"
            isValid={true}
            onChange={(text) => handleChoiceChange(index, text)}
            placeholder={intl.formatMessage({
                id: 'post_poll.choice_placeholder',
            }, { number: index + 1 })}
            isEditable
            value={choice}
            wrapperStyle={styles.inputWrapper}
            inputStyle={styles.input}
        />
    )


    return (
        <View style={{ width: getWindowDimensions().width, height: 400 }}>
            <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} >
                <Text style={styles.title}>{intl.formatMessage({ id: 'post_poll.create_title' })}</Text>
                <FormInput
                    rightIconName="progress-question"
                    iconType="MaterialCommunityIcons"
                    isValid={true}
                    onChange={_onQuestionChange}
                    placeholder={intl.formatMessage({
                        id: 'post_poll.question_placeholder',
                    })}
                    isEditable
                    value={pollDraft.title}
                    wrapperStyle={styles.inputWrapper}
                    inputStyle={styles.input}
                />

                <Text style={styles.label}>Choices</Text>
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


                <TextButton textStyle={styles.addChoice} text="Reset Poll" onPress={resetPoll} />
                <TextButton textStyle={styles.addChoice} text="Attach Poll" onPress={createPoll} />

            </KeyboardAwareScrollView>

            <PollConfig ref={pollConfigRef} pollDraft={pollDraft} setPollDraft={setPollDraft} />

            <DatePicker
                type="datetime"
                modal={true}
                onChanged={() => { }}
                date={new Date(pollDraft.endTime)}
                open={showDatePicker}
                onConfirm={(date) => {
                    _onExpiryDateChange(date)
                    setShowDatePicker(false)
                }}
                onCancel={() => {
                    setShowDatePicker(false)
                }}
            />
        </View>
    );
};
