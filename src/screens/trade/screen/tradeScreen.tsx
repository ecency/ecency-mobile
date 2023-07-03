import React, { useState } from 'react';
import { View, Button } from 'react-native';
import styles from '../styles/tradeScreen.styles';
import { SwapInput } from '../children';


const TradeScreen = () => {
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
      <SwapInput
        label="Label 1"
        onChangeText={handleTextChange}
        value={textValue}
      />
      <SwapInput
        label="Label 2"
        onChangeText={handleTextChange}
        value={textValue}
      />
      <Button title="Continue" onPress={handleContinue} />
    </View>
  );
};

export default TradeScreen;