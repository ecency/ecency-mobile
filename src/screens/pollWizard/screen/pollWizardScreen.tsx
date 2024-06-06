import React from "react"
import { PollsWizardContent } from "../../../components/pollsWizardModal/children/pollsWizardContent"
import { View } from "react-native";
import styles from "../styles/pollWizardScreen.styles";
import { BasicHeader } from "../../../components";
import { useIntl } from "react-intl";


const PollWizardScreen = ({ route }) => {

    const intl = useIntl();
    const draftId = route.params?.draftId;

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