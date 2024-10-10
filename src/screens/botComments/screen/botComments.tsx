import React, { useState } from 'react';

// Services and Actions

import { View } from 'react-native';
import { Comments, BasicHeader } from '../../../components';
import styles from '../styles/botComments.styles';
import { useIntl } from 'react-intl';
import { SafeAreaView } from 'react-native-safe-area-context';


export const BotComments = ({ route }) => {
    const intl = useIntl();

    const [comments] = useState<any>(route.params?.comments || []);


    const _renderContent = (
        <View style={styles.container}>
            <Comments
                comments={comments}
                fetchPost={() => {
                    console.log('implement fetch if required');
                }}

            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <BasicHeader
                    title={intl.formatMessage({ id: 'comments.bot_comments' })}
                    backIconName={'close'}
                />
                {_renderContent}
            </View>
        </SafeAreaView>
    );
};
