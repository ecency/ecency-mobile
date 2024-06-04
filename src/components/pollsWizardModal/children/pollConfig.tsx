
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/pollsWizardContent.styles';
import { FormInput } from '../../formInput';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import SettingsItem from '../../settingsItem';
import BasicHeader from '../../basicHeader';
import { PollMetadata, PollPreferredInterpretation } from '../../../providers/hive/hive.types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useIntl } from 'react-intl';


interface Props {
    pollMeta: PollMetadata,
    setPollMeta: (meta: PollMetadata) => void
}

export const PollConfig = forwardRef(({ pollMeta, setPollMeta }: Props, ref) => {
    const intl = useIntl();
    const [visible, setVisible] = useState(false);
    const _interpretations = Object.values(PollPreferredInterpretation);

    useImperativeHandle(ref, () => ({
        showConfig: () => {
            setVisible(true)
        }
    }))

    const _onAgeLimitChange = (text) => {

        const val = parseInt(text);
        if (val >= 0) {
            setPollMeta({
                ...pollMeta,
                filters: {
                    account_age: val
                }
            })
        }

    }

    const _onMaxOptionsChange = (text) => {
        const val = parseInt(text);
        if (val >= 0) {
            setPollMeta({
                ...pollMeta,
                max_choices_voted: val
            })
        }
    }


    const _onInterpretationChange = (index: number) => {
        const preferred_interpretation = _interpretations[index];
        setPollMeta({
            ...pollMeta,
            preferred_interpretation
        })
    }


    const _onShowVotesChange = (val: boolean) => {
        setPollMeta({
            ...pollMeta,
            hide_votes: !val
        })
    }

    const _onVoteChangeUpdate = (val: boolean) => {
        setPollMeta({
            ...pollMeta,
            vote_change: val
        })
    }




    return (
        <>
            {visible && <Animated.View style={styles.optionsContainer} exiting={SlideOutRight} entering={SlideInRight}>
                <BasicHeader
                    handleOnBackPress={() => { setVisible(false) }}
                    title={"Edit Configuration"}
                />
                <KeyboardAwareScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
                    <Text style={styles.label}>Min. Account Age (Days)</Text>
                    <FormInput
                        rightIconName="calendar"
                        iconType="MaterialCommunityIcons"
                        isValid={true}
                        onChange={_onAgeLimitChange}
                        placeholder={"minimum account age, default is 100"}
                        isEditable
                        value={pollMeta.filters?.account_age + ''}
                        wrapperStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        keyboardType='numeric'
                    />

                    <Text style={styles.label}>Max Options</Text>
                    <FormInput
                        rightIconName="check-all"
                        iconType="MaterialCommunityIcons"
                        isValid={true}
                        onChange={_onMaxOptionsChange}
                        placeholder={"minimum account age, default is 100"}
                        isEditable
                        value={pollMeta.max_choices_voted + ''}
                        wrapperStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        keyboardType='numeric'
                    />


                    <SettingsItem
                        title={'Poll Interpretation'}
                        titleStyle={styles.settingsTitle}
                        type="dropdown"
                        actionType="language"
                        options={
                            _interpretations.map(id => intl.formatMessage({
                                id: `post_poll.${id}`
                            }))
                        }
                        selectedOptionIndex={_interpretations.indexOf(pollMeta.preferred_interpretation)}
                        handleOnChange={_onInterpretationChange}
                        wrapperStyle={styles.settingsWrapper}
                    />


                    <SettingsItem
                        title={"Show votes "}
                        text={"show more votes"}
                        type="toggle"
                        actionType={'show_votes'}
                        titleStyle={styles.settingsTitle}
                        wrapperStyle={styles.settingsWrapper}
                        handleOnChange={_onShowVotesChange}
                        isOn={!pollMeta.hide_votes}
                    />


                    <SettingsItem
                        title={"Vote Change"}
                        text={"show more votes"}
                        type="toggle"
                        actionType={'show_votes'}
                        titleStyle={styles.settingsTitle}
                        wrapperStyle={styles.settingsWrapper}
                        handleOnChange={_onVoteChangeUpdate}
                        isOn={pollMeta.vote_change}
                    />



                </KeyboardAwareScrollView>



            </Animated.View>}
        </>

    )
})