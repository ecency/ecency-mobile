import React from 'react';
import { Text, View } from 'react-native';
import { injectIntl } from 'react-intl';
import QRCode from 'react-native-qrcode-svg';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BasicHeader, TextBoxWithCopy } from '../../../components';

import styles from './transferStyles';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */
interface AddressViewProps {
  intl: any;
  transferType: string;
  tokenAddress?: string;
  handleOnModalClose: () => void;
  fundType: string;
}

const AddressView = ({
  intl,
  transferType,
  tokenAddress,
  handleOnModalClose,
  fundType,
}: AddressViewProps) => {
  const address = tokenAddress || '';
  const assetSymbol = fundType;

  const showReceiveContent = Boolean(address);

  return (
    <SafeAreaView style={styles.container}>
      <BasicHeader
        title={`${intl.formatMessage({ id: `wallet.${transferType}` })}${
          assetSymbol ? ` · ${assetSymbol}` : ''
        }`}
        backIconName="close"
        handleOnPressBackButton={handleOnModalClose}
        handleOnPressClose={handleOnModalClose}
      />
      <View
        style={{ flex: 1, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center' }}
      >
        {showReceiveContent ? (
          <View style={styles.contentContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={address}
                size={200}
                logoSize={50}
                logoMargin={2}
                logoBackgroundColor="transparent"
              />
            </View>

            <View style={styles.addressWrapper}>
              <TextBoxWithCopy
                label={intl.formatMessage(
                  { id: 'wallet.address_label', defaultMessage: '{symbol} Address.' },
                  { symbol: assetSymbol },
                )}
                value={address}
              />
            </View>
          </View>
        ) : (
          <View style={styles.middleContent}>
            <Text style={styles.description}>
              {intl.formatMessage({
                id: 'wallet.address_unavailable',
                defaultMessage: 'Address information is not available for this asset.',
              })}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const mapStateToProps = (state) => ({
  pinCode: state.application.pin,
  globalProps: state.account.globalProps,
  currency: state.application.currency.currency,
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default connect(mapStateToProps)(injectIntl(AddressView));
