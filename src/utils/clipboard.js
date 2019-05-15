import { Clipboard } from 'react-native';

const readFromClipboard = async () => {
  const clipboardContent = await Clipboard.getString();
  return clipboardContent;
};

<<<<<<< HEAD
const writeToClipboard = async text => {
=======
const writeToClipboard = async (text) => {
  if (!text) return false;

>>>>>>> 3bd23bb1faf32382b70b2851b200099e6dd0b945
  await Clipboard.setString(text);

  return true;
};

export { writeToClipboard, readFromClipboard };
