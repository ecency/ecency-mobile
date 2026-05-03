import Clipboard from '@react-native-clipboard/clipboard';
import { Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import RNFetchBlob from 'rn-fetch-blob';

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

  // expo-image-manipulator on iOS does not reliably accept data: URIs, so
  // first write the base64 PNG to a temp file and pass the file:// URI.
  const timestamp = Date.now();
  const tempPath = `${RNFetchBlob.fs.dirs.CacheDir}/pasted_${timestamp}.png`;
  await RNFetchBlob.fs.writeFile(tempPath, base64, 'base64');
  const fileUri = `file://${tempPath}`;
  const rendered = await ImageManipulator.manipulate(fileUri).renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
  // Best-effort cleanup of the intermediate PNG; ignore failures.
  RNFetchBlob.fs.unlink(tempPath).catch(() => {});

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
