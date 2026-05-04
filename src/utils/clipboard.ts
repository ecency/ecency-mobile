import Clipboard from '@react-native-clipboard/clipboard';
import { Image, Platform } from 'react-native';
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

// iOS uses hasImage()/getImagePNG(). Android has no hasImage(), but getImage()
// returns a data: URI when an image is on the clipboard (or "" when not).
// Detection helper for the auto-paste chip; on Android we have to actually
// fetch the image to know — callers should treat false as "unknown" and still
// allow the manual paste button.
const hasClipboardImage = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      return await Clipboard.hasImage();
    }
    const data = await Clipboard.getImage();
    return !!data && data.startsWith('data:image/');
  } catch {
    return false;
  }
};

const readImageFromClipboard = async (): Promise<ClipboardImage | null> => {
  let raw: string | null = null;
  let mimeFromUri = 'image/png';

  if (Platform.OS === 'ios') {
    const hasImage = await Clipboard.hasImage();
    if (!hasImage) {
      return null;
    }
    raw = await Clipboard.getImagePNG();
  } else {
    // Android getImage returns "data:<mime>;base64,<payload>" or "" if none.
    const data = await Clipboard.getImage();
    if (!data) {
      return null;
    }
    raw = data;
    const mimeMatch = data.match(/^data:(image\/[a-z+]+);base64,/i);
    if (mimeMatch) {
      mimeFromUri = mimeMatch[1].toLowerCase();
    }
  }

  if (!raw) {
    return null;
  }

  // Strip an optional data: URI prefix; we only want the raw base64 to write.
  const rawBase64 = raw.replace(/^data:image\/[a-z+]+;base64,/i, '');

  const ext = mimeFromUri === 'image/jpeg' || mimeFromUri === 'image/jpg' ? 'jpg' : 'png';
  const timestamp = Date.now();
  const filename = `pasted_${timestamp}.${ext}`;
  const tempPath = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;
  await RNFetchBlob.fs.writeFile(tempPath, rawBase64, 'base64');
  const fileUri = `file://${tempPath}`;

  const { width, height } = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => {
      Image.getSize(
        fileUri,
        (w, h) => resolve({ width: w, height: h }),
        (err) => reject(err),
      );
    },
  );

  return {
    path: fileUri,
    mime: mimeFromUri,
    filename,
    width,
    height,
    size: 0,
  };
};

export { writeToClipboard, readFromClipboard, readImageFromClipboard, hasClipboardImage };
