import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import ActionSheet from 'react-native-actionsheet';

interface Props {
  options: string[];
  title: string;
  cancelButtonIndex: number;
  destructiveButtonIndex?: number;
  onPress: (index: number) => void;
}

export const OptionsModal = forwardRef(({ onPress, ...props }: Props, ref: any) => {
  const actionSheetRef = useRef<any>();
  const callbackRef = useRef<any>();

  useEffect(() => {
    callbackRef.current = onPress;
  }, [onPress]);

  useImperativeHandle(ref, () => ({
    show() {
      if (actionSheetRef.current) {
        actionSheetRef.current.show();
      }
    },
  }));

  const _onPress = (index: number) => {
    callbackRef.current(index);
  };

  return <ActionSheet ref={actionSheetRef} onPress={_onPress} {...props} />;
});
