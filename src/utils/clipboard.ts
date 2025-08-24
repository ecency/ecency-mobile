import Clipboard from '@react-native-clipboard/clipboard';

const readFromClipboard = async (): Promise<string> => {
  const clipboardContent = await Clipboard.getString();
  return clipboardContent;
};

const writeToClipboard = async (text?: string): Promise<boolean> => {
  if (!text) {
    return false;
  }

  await Clipboard.setString(text);

  return true;
};

export { writeToClipboard, readFromClipboard };
