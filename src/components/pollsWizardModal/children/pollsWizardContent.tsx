import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import styles from '../styles/pollsWizardContent.styles';
import { useIntl } from 'react-intl';
import { TextButton } from '../../buttons';
import { FormInput } from '../../formInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import DatePicker from 'react-native-date-picker';
import Animated, { SlideInDown, SlideInLeft, SlideInRight, SlideOutDown, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import moment from 'moment/moment';
import { dateToFormatted } from '../../../utils/time';

export const PollsWizardContent = () => {
    const intl = useIntl();

    const [question, setQuestion] = useState('');
    const [choices, setChoices] = useState<string[]>(['', '']);
    const [expiryDateTime, setExpiryDateTime] = useState(new Date());
    const [selectedAge, setSelectedAge] = useState(null);
    const [selectedPollMode, setSelectedPollMode] = useState(null);
    const [maxOptions, setMaxOptions] = useState(1);
    const [showVotes, setShowVotes] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);

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
                <TouchableOpacity onPress={()=>{setShowDatePicker(true)}} >
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


    const _renderOptions = () => {
        return (
            <>
                {showOptions && (
                    <Animated.View style={styles.optionsContainer} exiting={SlideOutRight} entering={SlideInRight}>

                        <TextButton
                            text={"Edit Options"}
                            onPress={() => { setShowOptions(true) }}
                            textStyle={styles.addChoice}
                        />
                        <Text>Age Range:</Text>
                        {/* Implement age range selector here */}

                        <Text>Poll Mode:</Text>
                        {/* Implement poll mode selector here */}

                        <Text>Max Options:</Text>
                        {/* Implement max options selector here */}

                        <Text>Show Votes:</Text>
                        {/* Implement toggle switch for vote visibility */}

                        <TextButton
                            text={"Back"}
                            onPress={() => { setShowOptions(false) }}
                            textStyle={styles.addChoice}
                        />


                    </Animated.View>
                )}
            </>
        )
    }

    return (
        <View style={{ width: getWindowDimensions().width, height: 400 }}>
            <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} >
                {/* <View style={styles.container}> */}
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
                {choices.map((choice, index) => (

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
                ))}

                <TextButton
                    text={intl.formatMessage({
                        id: 'post_poll.add_choice',
                    })}
                    onPress={addChoice}
                    textStyle={styles.addChoice}
                />

                {_renderEndTime()}


                <TextButton
                    text={"Edit Options"}
                    onPress={() => { setShowOptions(true) }}
                    textStyle={styles.addChoice}
                />



                <Button title="Reset Poll" onPress={resetPoll} />
                {/* </View> */}
            </KeyboardAwareScrollView>

            {_renderOptions()}

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
