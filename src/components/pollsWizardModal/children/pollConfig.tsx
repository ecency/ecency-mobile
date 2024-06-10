
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import styles from '../styles/pollConfig.styles';
import { FormInput } from '../../formInput';
import SettingsItem from '../../settingsItem';
import { PollPreferredInterpretation } from '../../../providers/hive/hive.types';
import { useIntl } from 'react-intl';
import { PollDraft } from '../../../providers/ecency/ecency.types';
import ActionSheet from 'react-native-actions-sheet';


interface Props {
    pollDraft: PollDraft,
    setPollDraft: (meta: PollDraft) => void
}

export const PollConfig = forwardRef(({ pollDraft, setPollDraft }: Props, ref) => {
    const intl = useIntl();
    const sheetModalRef = useRef(null);

    const _interpretations = Object.values(PollPreferredInterpretation);

    useImperativeHandle(ref, () => ({
        showConfig: () => {
            sheetModalRef.current?.show()
        }
    }))

    const _onAgeLimitChange = (text) => {

        const val = parseInt(text);
        if (val >= 0) {
            setPollDraft({
                ...pollDraft,
                filters: {
                    accountAge: val
                }
            })
        }

    }

    const _onMaxOptionsChange = (text) => {
        const val = parseInt(text);
        if (val >= 0) {
            setPollDraft({
                ...pollDraft,
                maxChoicesVoted: val
            })
        }
    }


    const _onInterpretationChange = (index: number) => {
        const interpretation = _interpretations[index];
        setPollDraft({
            ...pollDraft,
            interpretation
        })
    }


    const _onShowVotesChange = (val: boolean) => {
        setPollDraft({
            ...pollDraft,
            hideVotes: !val
        })
    }

    const _onVoteChangeUpdate = (val: boolean) => {
        setPollDraft({
            ...pollDraft,
            voteChange: val
        })
    }




    const _renderFormContent = (
        <View style={styles.optionsContainer}>
            {/* <BasicHeader
                handleOnBackPress={() => { setVisible(false) }}
                title={"Edit Configuration"}
            /> */}
            {/* <KeyboardAwareScrollView contentContainerStyle={{ paddingHorizontal: 16 }}> */}
                <Text style={styles.label}>Min. Account Age (Days)</Text>
                <FormInput
                    rightIconName="calendar"
                    iconType="MaterialCommunityIcons"
                    isValid={true}
                    onChange={_onAgeLimitChange}
                    placeholder={"minimum account age, default is 100"}
                    isEditable
                    value={pollDraft.filters?.accountAge + ''}
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
                    value={pollDraft.maxChoicesVoted + ''}
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
                    selectedOptionIndex={_interpretations.indexOf(pollDraft.interpretation)}
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
                    isOn={!pollDraft.hideVotes}
                />


                <SettingsItem
                    title={"Vote Change"}
                    text={"show more votes"}
                    type="toggle"
                    actionType={'show_votes'}
                    titleStyle={styles.settingsTitle}
                    wrapperStyle={styles.settingsWrapper}
                    handleOnChange={_onVoteChangeUpdate}
                    isOn={pollDraft.voteChange}
                />






        </View>

    )

    return (
        <ActionSheet
            ref={sheetModalRef}
            gestureEnabled={true}
            closeOnTouchBackdrop={true}
            containerStyle={styles.sheetContent}
            indicatorStyle={styles.sheetIndicator}>
            {_renderFormContent}

        </ActionSheet>
    )
})