import React, { useState, useReducer, useRef } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import styles from '../styles/pollsWizardContent.styles';
import { useIntl } from 'react-intl';
import { IconButton, TextButton } from '../../buttons';
import { FormInput } from '../../formInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import DatePicker from 'react-native-date-picker';
import Animated, { SlideInDown, SlideInLeft, SlideInRight, SlideOutDown, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import moment from 'moment/moment';
import { dateToFormatted } from '../../../utils/time';
import SettingsItem from '../../settingsItem';
import { MainButton } from '../../mainButton';
import BasicHeader from '../../basicHeader';
import { PollConfig } from './pollConfig';
import { PollMetadata, PollPreferredInterpretation } from '../../../providers/hive/hive.types';

export const PollsWizardContent = () => {
    const intl = useIntl();

    const pollConfigRef = useRef<typeof PollConfig>(null);

    const [question, setQuestion] = useState('');
    const [choices, setChoices] = useState<string[]>(['', '']);
    const [expiryDateTime, setExpiryDateTime] = useState(new Date());
    const [selectedAge, setSelectedAge] = useState(100);
    const [selectedPollMode, setSelectedPollMode] = useState(null);
    const [maxOptions, setMaxOptions] = useState(1);
    const [showVotes, setShowVotes] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);


    const [pollMeta, setPollMeta] = useState<PollMetadata>({
        question: '',
        choices: [],
        filters: {
            account_age: 100,
        },
        preferred_interpretation: PollPreferredInterpretation.NUMBER_OF_VOTES,
        vote_change: false,
        hide_votes: false,
        max_choices_voted: 1,
        end_time: new Date().getTime()
    })

    const addChoice = () => {
        setChoices([...choices, '']);
    };

    const handleChoiceChange = (index, value) => {
        const newChoices = [...choices];
        newChoices[index] = value;
        setChoices(newChoices);
    };

    const createPoll = () => {
        // Implement poll creation logic here
        console.log('Poll created!');
    };

    const resetPoll = () => {
        setQuestion('');
        setChoices(['', '']);
        setExpiryDateTime(new Date());
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

        // onBlur={() => _checkUsernameIsValid(username)} //TODO: use it to auto save poll configuration
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
                    onChange={setQuestion}
                    placeholder={intl.formatMessage({
                        id: 'post_poll.question_placeholder',
                    })}
                    isEditable
                    value={question}
                    wrapperStyle={styles.inputWrapper}
                    inputStyle={styles.input}
                // onBlur={() => _checkUsernameIsValid(username)} //TODO: use it to auto save poll configuration
                />

                <Text style={styles.label}>Choices</Text>
                {choices.map(_renderChoiceInput)}

                <TextButton
                    text={intl.formatMessage({
                        id: 'post_poll.add_choice',
                    })}
                    onPress={addChoice}
                    textStyle={styles.addChoice}
                />

                {_renderEndTime()}
                {_renderConfig()}


                <Button title="Reset Poll" onPress={resetPoll} />
            </KeyboardAwareScrollView>

            <PollConfig ref={pollConfigRef} pollMeta={pollMeta} setPollMeta={setPollMeta} />

            <DatePicker
                type="datetime"
                modal={true}
                onChanged={() => { }}
                date={expiryDateTime}
                open={showDatePicker}
                onConfirm={(date) => {
                    setExpiryDateTime(date);
                    setShowDatePicker(false)
                }}
                onCancel={() => {
                    setShowDatePicker(false)
                }}
            />
        </View>
    );
};
