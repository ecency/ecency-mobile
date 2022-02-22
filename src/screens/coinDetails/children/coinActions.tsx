import React, { Fragment } from 'react'
import { useIntl } from 'react-intl'
import { View, Text, Alert } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import styles from './children.styles'

interface CoinActionsProps {
    coinId:string;
    actions:string[];
}

const CoinActions = ({coinId, actions}:CoinActionsProps) => {
    const intl = useIntl();

    const _navigate = (action:string) => {
       Alert.alert("Action Press", action)
    }

    const _renderItem = (item) => {

        const _onPress = () => {
            _navigate(item)
        }

        return (
            <TouchableOpacity style={styles.actionContainer} containerStyle={styles.actionBtnContainer} onPress={_onPress}>
                <Fragment>
                    <Text style={styles.actionText}>
                        {intl.formatMessage({id:`wallet.${item}`})}
                    </Text>
                </Fragment>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.actionsContainer}>
            {actions.map(_renderItem)}
        </View>
    )
}

export default CoinActions