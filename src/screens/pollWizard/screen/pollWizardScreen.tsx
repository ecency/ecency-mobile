import React from "react"
import { PollsWizardContent } from "../../../components/pollsWizardModal/children/pollsWizardContent"
import { View } from "react-native";
import styles from "../styles/pollWizardScreen.styles";
import { BasicHeader } from "../../../components";
import { useIntl } from "react-intl";
import { DEFAULT_USER_DRAFT_ID } from "../../../redux/constants/constants";


const PollWizardScreen = ({ route }) => {

    const intl = useIntl();
    const draftId = route.params?.draftId || DEFAULT_USER_DRAFT_ID;

    return (
        <View style={styles.container}>
            <BasicHeader
                title={intl.formatMessage({ id: 'post_poll.create_title' })}
                backIconName="close"
            />
            <PollsWizardContent draftId={draftId} />
        </View>
    )
}

export default PollWizardScreen