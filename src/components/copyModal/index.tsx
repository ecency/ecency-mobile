// CopyModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

const CopyModal = ({
  visible,
  onClose,
  text,
}: {
  visible: boolean;
  onClose: () => void;
  text: string;
}) => {
  const handleCopy = () => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Text has been copied to clipboard.');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modal}>
          <Text selectable style={styles.text}>
            {text}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleCopy}>
            <Text style={styles.buttonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

export default CopyModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
