import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/pollsWizardContent.styles';
import { useIntl } from 'react-intl';
import { TextButton } from '../../buttons';
import { FormInput } from '../../formInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DatePicker from 'react-native-date-picker';
import { dateToFormatted } from '../../../utils/time';
import { PollConfig } from './pollConfig';
import { PollPreferredInterpretation } from '../../../providers/hive/hive.types';
import { useDispatch } from 'react-redux';
import { removePollDraft, setPollDraftAction } from '../../../redux/actions/editorActions';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';
import { PollDraft } from '../../../providers/ecency/ecency.types';
import { useAppSelector } from '../../../hooks';
import { MainButton } from '../../mainButton';
import { useNavigation } from '@react-navigation/native';
import IconButton from '../../iconButton';
import EStyleSheet from 'react-native-extended-stylesheet';

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
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() //set to 7 days from now
}


export const PollsWizardContent = ({ draftId }: { draftId?: string }) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const pollConfigRef = useRef<typeof PollConfig>(null);

    const pollDraftsMeta = useAppSelector(state => state.editor.pollDraftsMap);
    const _pollAtttaced = draftId && pollDraftsMeta[draftId]

    const _initPollDraft = useMemo(() => _pollAtttaced
        ? pollDraftsMeta[draftId] : INIT_POLL_DRAFT,
        [])


    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pollDraft, setPollDraft] = useState<PollDraft>(_initPollDraft)
    const [isValid, setIsValid] = useState(false);

    const expiryDateTime = new Date(pollDraft.endTime) //TOOD: adjust time formate to match with web
    const _mainBtnTitle = intl.formatMessage({
        id: _pollAtttaced
            ? 'post_poll.update_poll' : 'post_poll.attach_poll'
    })


    useEffect(() => {
        if (pollDraft && !!pollDraft.title) {
            const hasNullOrEmpty = pollDraft.choices.some(item => item === null || item === "");
            setIsValid(!hasNullOrEmpty);
            return;
        }
        setIsValid(false);
    }, [pollDraft])

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

    const _removeChoice = (index) => {
        pollDraft.choices.splice(index, 1);
        setPollDraft({
            ...pollDraft,
            choices: [
                ...pollDraft.choices,
            ]
        })
    }

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
        navigation.goBack();
    };

    const resetPoll = () => {
        setPollDraft(INIT_POLL_DRAFT);
        dispatch(removePollDraft(draftId || DEFAULT_USER_DRAFT_ID));
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
        <View style={styles.inputContainer}>
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
            {index > 1 && (
                <IconButton
                    iconType="MaterialIcons"
                    color={EStyleSheet.value('$iconColor')}
                    size={24}
                    name={'close'}
                    style={styles.btnRemove}
                    onPress={() => { _removeChoice(index) }}
                />
            )}
        </View>

    )


    return (
        <View style={{ flex: 1 }}>
            <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} >
                <Text style={styles.label}>{intl.formatMessage({ id: 'post_poll.poll_question' })}</Text>
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

                <View style={styles.actionPanel}>
                    <MainButton style={styles.btnMain} text={_mainBtnTitle} isDisable={!isValid} onPress={createPoll} />
                    <TextButton textStyle={styles.btnReset} text="Reset Poll" onPress={resetPoll} />
                </View>

            </KeyboardAwareScrollView>

            <PollConfig ref={pollConfigRef} pollDraft={pollDraft} setPollDraft={setPollDraft} />

            <DatePicker
                type="datetime"
                modal={true}
                onChanged={() => { }}
                minimumDate={new Date()}
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
