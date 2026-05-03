import { useEffect, useRef } from 'react';
import { TextInput } from 'react-native';

/**
 * Wires up an uncontrolled TextInput that avoids the Android typing race caused
 * by controlled `value={state}` bindings repeatedly calling setNativeProps mid-typing.
 *
 * Spread `inputProps` onto the TextInput. Use `setText` to programmatically write
 * (e.g. live transforms like lowercasing, paste sanitation, form resets). Sync from
 * `externalValue` only happens while the field is unfocused.
 */
export interface UncontrolledInputAPI {
  ref: React.RefObject<TextInput | null>;
  setText: (text: string) => void;
  inputProps: {
    ref: React.RefObject<TextInput | null>;
    defaultValue: string;
    onFocus: () => void;
    onBlur: () => void;
    onChangeText: (text: string) => void;
  };
}

export interface UseUncontrolledInputOptions {
  onFocus?: () => void;
  onBlur?: () => void;
}

export function useUncontrolledInput(
  externalValue: string | undefined,
  onTextChange?: (text: string) => void,
  options?: UseUncontrolledInputOptions,
): UncontrolledInputAPI {
  const ref = useRef<TextInput>(null);
  const lastTextRef = useRef<string>(externalValue || '');
  const isFocusedRef = useRef(false);

  const setText = (text: string) => {
    lastTextRef.current = text;
    ref.current?.setNativeProps({ text });
  };

  // Sync from external value when not focused — covers async hydration,
  // form resets, and programmatic value changes from outside.
  useEffect(() => {
    if (isFocusedRef.current) return;
    const v = externalValue || '';
    if (v !== lastTextRef.current) {
      setText(v);
    }
  }, [externalValue]);

  const handleFocus = () => {
    isFocusedRef.current = true;
    options?.onFocus?.();
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    // If parent normalized text during typing (e.g. login lowercases) and the
    // field still shows the user's raw input, snap it to the parent value.
    const v = externalValue || '';
    if (v !== lastTextRef.current) {
      setText(v);
    }
    options?.onBlur?.();
  };

  const handleChangeText = (text: string) => {
    lastTextRef.current = text;
    onTextChange?.(text);
  };

  return {
    ref,
    setText,
    inputProps: {
      ref,
      defaultValue: externalValue || '',
      onFocus: handleFocus,
      onBlur: handleBlur,
      onChangeText: handleChangeText,
    },
  };
}
