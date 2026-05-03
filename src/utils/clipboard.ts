import Clipboard from '@react-native-clipboard/clipboard';
import { Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

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

export interface ClipboardImage {
  path: string;
  mime: string;
  filename: string;
  width: number;
  height: number;
  size: number;
}

// iOS-only: hasImage/getImagePNG return false/empty on Android in this lib version.
const readImageFromClipboard = async (): Promise<ClipboardImage | null> => {
  if (Platform.OS !== 'ios') {
    return null;
  }

  const hasImage = await Clipboard.hasImage();
  if (!hasImage) {
    return null;
  }

  const base64 = await Clipboard.getImagePNG();
  if (!base64) {
    return null;
  }

  // Materialize the base64 PNG to a real file URI so the upload pipeline
  // (FormData + multipart) and HEIC/compress paths can treat it like any picked image.
  const dataUri = `data:image/png;base64,${base64}`;
  const rendered = await ImageManipulator.manipulate(dataUri).renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });

  return {
    path: result.uri,
    mime: 'image/jpeg',
    filename: `pasted_${Date.now()}.jpg`,
    width: result.width,
    height: result.height,
    size: 0,
  };
};

export { writeToClipboard, readFromClipboard, readImageFromClipboard };
