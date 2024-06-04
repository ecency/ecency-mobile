
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

    useImperativeHandle(ref, () => ({
        showConfig: () => {
            setVisible(true)
        }
    }))

    return (
        <>
            {visible && <Animated.View style={styles.optionsContainer} exiting={SlideOutRight} entering={SlideInRight}>
                <BasicHeader
                    handleOnBackPress={() => { setVisible(false) }}
                    title={"Edit Configuration"}
                />
                <KeyboardAwareScrollView contentContainerStyle={{paddingHorizontal: 16 }}>
                <Text style={styles.label}>Min. Account Age (Days)</Text>
                    <FormInput
                        rightIconName="calendar"
                        iconType="MaterialCommunityIcons"
                        isValid={true}
                        onChange={(text) => { }}
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
                        onChange={(text) => { }}
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
                            Object.values(PollPreferredInterpretation).map(id=>intl.formatMessage({
                                id:`post_poll.${id}`
                            }))
                        }
                        selectedOptionIndex={0}
                        handleOnChange={() => { }}
                        wrapperStyle={styles.settingsWrapper}
                    />


                    <SettingsItem
                        title={"Show votes "}
                        text={"show more votes"}
                        type="toggle"
                        actionType={'show_votes'}
                        titleStyle={styles.settingsTitle}
                        wrapperStyle={styles.settingsWrapper}
                        handleOnChange={() => { }}
                        isOn={!pollMeta.hide_votes}
                    />


                    <SettingsItem
                        title={"Vote Change"}
                        text={"show more votes"}
                        type="toggle"
                        actionType={'show_votes'}
                        titleStyle={styles.settingsTitle}
                        wrapperStyle={styles.settingsWrapper}
                        handleOnChange={() => { }}
                        isOn={pollMeta.vote_change}
                    />

           

                </KeyboardAwareScrollView>
             
                  

            </Animated.View>}
        </>

    )
})