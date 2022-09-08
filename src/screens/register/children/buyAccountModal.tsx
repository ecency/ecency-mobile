import { View, Text, Image, Platform } from 'react-native'
import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import ActionSheet from 'react-native-actions-sheet'
import styles from '../styles/buyAccountModalStyles';
import EStyleSheet from 'react-native-extended-stylesheet';
import { InAppPurchaseContainer } from '../../../containers';
import { useIntl } from 'react-intl';
import { useAppSelector } from '../../../hooks';
import { BasicHeader, BoostPlaceHolder, ProductItemLine } from '../../../components';
import UserRibbon from '../../../components/userRibbon/userRibbon';
import get from 'lodash/get';
import LOGO_ESTM from '../../../assets/esteemcoin_boost.png';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
    username: string;
    email: string;
}

const ITEM_SKUS = Platform.select({
    ios: ['999accounts'],
    android: ['999accounts'],
});

export const BuyAccountModal = forwardRef(({ username, email }: Props, ref) => {
    const intl = useIntl();
    const sheetModalRef = useRef<ActionSheet>(null);

    const currentAccount = useAppSelector((state) => state.account.currentAccount);


    useImperativeHandle(
        ref,
        () => ({
            showModal: () => {
                if (sheetModalRef.current) {
                    sheetModalRef.current?.show();
                }

            }
        })
    )

    const _renderContent = () => {
        return (
            <InAppPurchaseContainer skus={ITEM_SKUS} username={username} isNoSpin>
                {({ buyItem, productList, isLoading, isProcessing }) => (
                    <SafeAreaView style={styles.container}>
                        <BasicHeader
                            backIconName='close'
                            disabled={isProcessing}
                            title={"Buy Ecency Account"}
                            isModalHeader={true}
                        />

                        {isLoading ? (
                            <BoostPlaceHolder />
                        ) : (
                            <View style={styles.contentContainer}>
                                <UserRibbon username={username ? username : currentAccount.name} />
                                <View style={styles.iconContainer}>
                                    <Image style={styles.logoEstm} source={LOGO_ESTM} />
                                    <Text style={styles.desc}>
                                        {intl.formatMessage({
                                            id: 'boost.account.desc',
                                        })}
                                    </Text>
                                </View>

                                <View style={styles.productsWrapper}>
                                    {productList.map((product) => (
                                        <ProductItemLine
                                            key={get(product, 'title')}
                                            isLoading={isLoading}
                                            disabled={isProcessing}
                                            product={product}
                                            title="Buy Account"
                                            handleOnButtonPress={(id) => buyItem(id)}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}
                    </SafeAreaView>
                )}
            </InAppPurchaseContainer>
        )
    }


    return (
        <ActionSheet
            ref={sheetModalRef}
            gestureEnabled={true}
            containerStyle={styles.sheetContent}
            onClose={() => { }}
            indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}>

            {_renderContent()}
        </ActionSheet>
    )
})
