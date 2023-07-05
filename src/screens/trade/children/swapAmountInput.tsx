import React from 'react';
import { View, TextInput, Text } from "react-native";

interface SwapInputProps {
    label: string;
    onChangeText?: (text: string) => void;
    value: string;
    fiatPrice: number;
    symbol: string;
    disabled?: boolean;
  }



// Reusable component for label, text input, and bottom text
export const SwapAmountInput = ({ label, onChangeText, value, fiatPrice, symbol } : SwapInputProps) => {

  const _fiatValue = ((Number(value) || 0) * fiatPrice).toFixed(3);

    return (
      <View>
        <Text>{label + ' ' + symbol}</Text>
        <TextInput
          editable={!!onChangeText}
          onChangeText={onChangeText}
          value={value}
          keyboardType='numeric'
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            marginBottom: 10,
          }}
        />
        <Text>{_fiatValue}</Text>
      </View>
    );
  };