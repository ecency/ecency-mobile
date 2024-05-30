import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import styles from '../styles/pollsWizardContent.styles';
import { useIntl } from 'react-intl';
import TextInput from '../../textInput';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TextButton } from '../../buttons';
import { FormInput } from '../../formInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export const PollsWizardContent = () => {
    const intl = useIntl();

    const [question, setQuestion] = useState('');
    const [choices, setChoices] = useState<string[]>(['', '']);
    const [expiryDateTime, setExpiryDateTime] = useState(null);
    const [selectedAge, setSelectedAge] = useState(null);
    const [selectedPollMode, setSelectedPollMode] = useState(null);
    const [maxOptions, setMaxOptions] = useState(1);
    const [showVotes, setShowVotes] = useState(false);

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

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.container} >
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

                <Text style={styles.label}>End Time</Text>
                {/* Implement date and time picker here */}

                <Text>Age Range:</Text>
                {/* Implement age range selector here */}

                <Text>Poll Mode:</Text>
                {/* Implement poll mode selector here */}

                <Text>Max Options:</Text>
                {/* Implement max options selector here */}

                <Text>Show Votes:</Text>
                {/* Implement toggle switch for vote visibility */}

                <Button title="Create Poll" onPress={createPoll} />
            {/* </View> */}
        </KeyboardAwareScrollView>
    );
};
