import Clipboard from '@react-native-clipboard/clipboard';

const readFromClipboard = async () => {
  const clipboardContent = await Clipboard.getString();
  return clipboardContent;
};

const writeToClipboard = async (text) => {
  if (!text) {
    return false;
  }

  await Clipboard.setString(text);

  return true;
};

export { writeToClipboard, readFromClipboard };
