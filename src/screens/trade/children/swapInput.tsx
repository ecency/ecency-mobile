import React from 'react';
import { View, TextInput, Text } from "react-native";

interface SwapInputProps {
    label: string;
    onChangeText: (text: string) => void;
    value: string;
    fiatValue: number;
    symbol: string;
  }



// Reusable component for label, text input, and bottom text
export const SwapInput = ({ label, onChangeText, value, fiatValue, symbol } : SwapInputProps) => {
    return (
      <View>
        <Text>{label}</Text>
        <TextInput
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
        <Text>{fiatValue}</Text>
      </View>
    );
  };