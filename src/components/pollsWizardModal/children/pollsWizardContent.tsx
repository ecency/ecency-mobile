import React, { useState, useRef } from 'react';
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


const INIT_POLL_META:PollMetadata = {
    question: '',
    choices: ['', ''],
    filters: {
        account_age: 100,
    },
    preferred_interpretation: PollPreferredInterpretation.NUMBER_OF_VOTES,
    vote_change: false,
    hide_votes: false,
    max_choices_voted: 1,
    end_time: new Date().getTime()
}


export const PollsWizardContent = () => {
    const intl = useIntl();

    const pollConfigRef = useRef<typeof PollConfig>(null);

    const [showDatePicker, setShowDatePicker] = useState(false);


    const [pollMeta, setPollMeta] = useState<PollMetadata>(INIT_POLL_META)

    const expiryDateTime = new Date(pollMeta.end_time) //TOOD: adjust time formate to match with web

    const addChoice = () => {
        // setChoices([...choices, '']);
        setPollMeta({
            ...pollMeta,
            choices:[
                ...pollMeta.choices,
                ''
            ]
        })
    };

    const handleChoiceChange = (index, value) => {
        const newChoices = [...pollMeta.choices];
        newChoices[index] = value;
        setPollMeta({
            ...pollMeta,
            choices:newChoices
        });
    };

    const createPoll = () => {
        // Implement poll creation logic here
        console.log('Poll created!');
    };

    const resetPoll = () => {
       setPollMeta(INIT_POLL_META)
    }


    const _onQuestionChange = (text) => {
        setPollMeta({
            ...pollMeta,
            question:text
        })
    }

    const _onExpiryDateChange = (date:Date) => {
        //TODO: add past and present checks
        setPollMeta({
            ...pollMeta,
            end_time:date.getTime()
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
                    value={pollMeta.question}
                    wrapperStyle={styles.inputWrapper}
                    inputStyle={styles.input}
                />

                <Text style={styles.label}>Choices</Text>
                {pollMeta.choices.map(_renderChoiceInput)}

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
                date={new Date(pollMeta.end_time)}
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
