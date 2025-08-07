import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, StyleSheet, Pressable } from 'react-native';

const CopyModal = ({
  visible,
  onClose,
  text,
}: {
  visible: boolean;
  onClose: () => void;
  text: string;
}) => {
  const inputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  useEffect(() => {
    if (visible) {
      setSelection({ start: 0, end: text.length });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [visible, text]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modal}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={text}
            multiline
            editable={false}
            selectTextOnFocus
            selection={selection}
            scrollEnabled
          />
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <View>
              <TextInput style={styles.buttonText} editable={false} value="Close" />
            </View>
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
  textInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  button: {
    marginTop: 16,
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
