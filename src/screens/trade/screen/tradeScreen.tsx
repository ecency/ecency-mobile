import React, { useState } from 'react';
import { View, Button } from 'react-native';
import styles from '../styles/tradeScreen.styles';
import { SwapInput } from '../children';
import { BasicHeader } from '../../../components';
import { useIntl } from 'react-intl';


const TradeScreen = () => {

    const intl = useIntl();

  const [textValue, setTextValue] = useState('');

  const handleTextChange = (text) => {
    setTextValue(text);
  };

  const handleContinue = () => {
    // Handle the continue button press
    console.log('Continue button pressed');
  };

  return (
    <View style={styles.container}>
        <BasicHeader title={intl.formatMessage({ id: 'transfer.trade_token' })} />
      <SwapInput
        label={intl.formatMessage({ id: 'transfer.from' })}
        onChangeText={handleTextChange}
        value={textValue}
      />
      <SwapInput
        label={intl.formatMessage({ id: 'transfer.to' })}
        onChangeText={handleTextChange}
        value={textValue}
      />
      <Button title="Continue" onPress={handleContinue} />
    </View>
  );
};

export default TradeScreen;