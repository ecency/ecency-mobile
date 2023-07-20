import React from 'react';
import { View, TextInput, Text } from "react-native";
import styles from '../styles/swapAmountInput.styles';
import { useAppSelector } from '../../../hooks';
import { formatNumberInputStr } from '../../../utils/number';

interface SwapInputProps {
  label: string;
  onChangeText?: (text: string) => void;
  value: string;
  fiatPrice: number;
  symbol: string;
  disabled?: boolean;
}



// Reusable component for label, text input, and bottom text
export const SwapAmountInput = ({ label, onChangeText, value, fiatPrice, symbol }: SwapInputProps) => {

  const currency = useAppSelector((state) => state.application.currency);

  const _fiatValue = ((Number(value) || 0) * fiatPrice).toFixed(3);

  const _onChangeText = (text: string) => {
    if(onChangeText){
      onChangeText(formatNumberInputStr(text, 3))
    }
    
  }


  return (
    <View style={styles.container} >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          editable={!!onChangeText}
          onChangeText={_onChangeText}
          value={value}
          keyboardType='numeric'
          style={styles.input}
          autoFocus={true}
        />
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{symbol}</Text>
        </View>
      </View>
      <Text style={styles.fiat}>{currency.currencySymbol + _fiatValue}</Text>
    </View>
  );
};