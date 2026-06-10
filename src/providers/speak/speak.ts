import * as tus from 'tus-js-client';
import { Video, Image } from 'react-native-image-crop-picker';
import Config from 'react-native-config';
import { EMBED_ENDPOINT } from './constants';
import { UploadTokenResponse, VideoUploadResult } from './speak.types';

// ---------------------------------------------------------------------------
// Token request — proxied through ecency.com so the API key never leaves server
// ---------------------------------------------------------------------------

/**
 * Request an upload token from the Ecency 3Speak proxy.
 *
 * The proxy validates the caller via the `code` field (HiveSigner access
 * token) that the ecencyApi interceptor injects automatically. We call it
 * directly here instead of through the interceptor because we need the raw
 * response shape.
 */
export async function requestUploadToken(
  owner: string,
  accessToken: string,
  isShort = false,
): Promise<UploadTokenResponse> {
  const res = await fetch(`${Config.ECENCY_BACKEND_API}/api/threespeak/upload-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, isShort, code: accessToken }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[3Speak] Token request failed: ${res.status} ${text}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Permlink extraction
// ---------------------------------------------------------------------------

/**
 * Extract the video permlink from an embed URL.
 * Handles `?v=owner/permlink` and `@owner/permlink` formats.
 */
export function extractPermlink(embedUrl: string): string {
  // ?v=user/permlink
  const vParam = embedUrl.match(/[?&]v=([^&]+)/);
  if (vParam?.[1]) {
    const parts = vParam[1].split('/');
    const permlink = parts[parts.length - 1];
    if (permlink) return permlink;
  }

  // @user/permlink
  const atFormat = embedUrl.match(/@[^/]+\/([a-zA-Z0-9]+)/);
  if (atFormat?.[1]) {
    return atFormat[1];
  }

  // last segment fallback
  const lastSegment = embedUrl.split('/').pop() ?? '';
  return lastSegment.split('?')[0].split('#')[0];
}

// ---------------------------------------------------------------------------
// Video upload — TUS resumable protocol
// ---------------------------------------------------------------------------

const MB = 1024 * 1024;

/**
 * Choose chunk size and parallelism based on the file size.
 *
 * Parallel uploads use the TUS Concatenation extension (supported by the
 * 3Speak tusd backend): the file is split into N parts uploaded concurrently,
 * then stitched server-side. Small files skip parallelism — there is no
 * throughput gain and it avoids zero-length parts. Chunk size is kept modest
 * so peak in-flight memory stays around chunkSize × parallelUploads, which
 * matters on RN where the whole file is already held in memory as a Blob.
 */
export function getUploadTuning(size: number): { chunkSize: number; parallelUploads: number } {
  if (size <= 10 * MB) return { chunkSize: 5 * MB, parallelUploads: 1 };
  if (size <= 500 * MB) return { chunkSize: 10 * MB, parallelUploads: 3 };
  return { chunkSize: 20 * MB, parallelUploads: 3 };
}

/**
 * Upload a video file using the new 3Speak embed architecture.
 *
 * The upload token carries the video's permlink and canonical embed URL
 * (assigned by the backend at token issuance), so the result no longer depends
 * on reading an X-Embed-URL response header. That is what makes parallel (TUS
 * Concatenation) uploads reliable: previously, when the final-concat response
 * didn't surface that header, the client treated a completed upload as a
 * failure and re-uploaded the whole file, producing duplicate uploads.
 *
 * Against an older backend that doesn't return a permlink with the token, we
 * fall back to a sequential, header-based upload. Neither path ever re-uploads,
 * so duplicates can't happen.
 */
export async function uploadVideoEmbed(
  media: Video | Image,
  owner: string,
  accessToken: string,
  isShort: boolean,
  progressCallback: (percentage: number) => void,
): Promise<VideoUploadResult> {
  // Build file reference for React Native.
  // Always use media.path — it's a local temp file copy from the picker.
  // On iOS, sourceURL can be ph:// or assets-library:// which XHR cannot fetch;
  // media.path is always a file:// compatible path on both platforms.
  const filePath = media.path;

  if (!filePath) {
    throw new Error('[3Speak] Failed to resolve file path');
  }

  const filename = (media as Video).filename || filePath.split('/').pop() || 'video.mp4';

  if (!media.size || media.size <= 0) {
    throw new Error('[3Speak] Unable to determine video file size');
  }

  // Convert the file to a Blob via RN fetch() which reliably handles both
  // file:// and plain paths on Android (including scoped storage).
  // tus-js-client's built-in uriToBlob uses XHR which fails on many Android
  // devices — that's the "cannot fetch file.uri as Blob" error.
  const fileUri = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
  let blob: Blob;
  try {
    const response = await fetch(fileUri);
    blob = await response.blob();
  } catch (e) {
    throw new Error(`[3Speak] Failed to read video file: ${e}`);
  }

  // Attach name and size so tus-js-client builds a unique fingerprint
  // (tus-rn/<name>/<size>/noexif/<endpoint>) for resumable upload bookkeeping.
  // Without these, all same-sized videos would collide.
  const file = blob as any;
  file.name = filename;
  file.size = media.size;

  const { token, upload_url, permlink, embed_url } = await requestUploadToken(
    owner,
    accessToken,
    isShort,
  );
  const endpoint = upload_url || `${EMBED_ENDPOINT}/uploads`;

  // Preferred path: the backend assigned the permlink/embed URL up front, so we
  // run a single upload (parallel for files > 10MB) and resolve with the known
  // URL on success — no header to capture, no re-upload.
  if (permlink && embed_url) {
    const { chunkSize, parallelUploads } = getUploadTuning(media.size);
    await runTusUpload(file, token, endpoint, chunkSize, parallelUploads, progressCallback);
    return { embedUrl: embed_url, permlink };
  }

  // Legacy backend: the embed URL only comes back via the X-Embed-URL header.
  // Use the sequential path — its single create→response keeps the header
  // reliable, and because it never re-uploads, a missing header surfaces as an
  // error instead of silently duplicating the upload.
  const { chunkSize } = getUploadTuning(media.size);
  return uploadFromHeader(file, token, endpoint, chunkSize, progressCallback);
}

const TUS_RETRY_DELAYS = [0, 3000, 5000, 10000, 20000];

/**
 * Run a TUS upload to completion. Resolves on success, rejects on error.
 * Aborts in-flight parts on error so a failed parallel upload doesn't keep
 * pushing bytes in the background.
 */
async function runTusUpload(
  file: any,
  token: string,
  endpoint: string,
  chunkSize: number,
  parallelUploads: number,
  progressCallback: (percentage: number) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint,
      chunkSize,
      parallelUploads,
      retryDelays: TUS_RETRY_DELAYS,
      headers: { Authorization: `Bearer ${token}` },
      metadata: { filename: file.name },
      onError(error: Error) {
        upload.abort().catch(() => {});
        reject(error);
      },
      onProgress(bytesUploaded: number, bytesTotal: number) {
        progressCallback(Number(((bytesUploaded / bytesTotal) * 100).toFixed(2)));
      },
      onSuccess() {
        resolve();
      },
    });

    upload.start();
  });
}

/**
 * Legacy fallback for backends that don't return a permlink with the token.
 * Uploads sequentially (parallelUploads = 1) and reads the embed URL from the
 * X-Embed-URL header on the create response.
 */
async function uploadFromHeader(
  file: any,
  token: string,
  endpoint: string,
  chunkSize: number,
  progressCallback: (percentage: number) => void,
): Promise<VideoUploadResult> {
  return new Promise<VideoUploadResult>((resolve, reject) => {
    let embedUrl = '';

    const upload = new tus.Upload(file, {
      endpoint,
      chunkSize,
      parallelUploads: 1,
      retryDelays: TUS_RETRY_DELAYS,
      headers: { Authorization: `Bearer ${token}` },
      metadata: { filename: file.name },
      onError(error: Error) {
        reject(error);
      },
      onProgress(bytesUploaded: number, bytesTotal: number) {
        progressCallback(Number(((bytesUploaded / bytesTotal) * 100).toFixed(2)));
      },
      onSuccess() {
        if (!embedUrl) {
          reject(new Error('[3Speak] Upload succeeded but no embed URL was returned'));
          return;
        }
        const permlink = extractPermlink(embedUrl);
        if (!permlink) {
          reject(new Error('[3Speak] Upload succeeded but permlink could not be extracted'));
          return;
        }
        resolve({ embedUrl, permlink });
      },
      onAfterResponse(_req: any, res: any) {
        const headerUrl = res.getHeader?.('x-embed-url') || res.getHeader?.('X-Embed-URL');
        if (headerUrl) {
          embedUrl = headerUrl;
        }
      },
    });

    upload.start();
  });
}

// ---------------------------------------------------------------------------
// Thumbnail — proxied through ecency.com
// ---------------------------------------------------------------------------

/**
 * Set a custom thumbnail for an uploaded video.
 * Calls the Ecency proxy which forwards to the 3Speak embed API.
 */
export async function setVideoThumbnail(
  permlink: string,
  thumbnailUrl: string,
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${Config.ECENCY_BACKEND_API}/api/threespeak/thumbnail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permlink, thumbnail_url: thumbnailUrl, code: accessToken }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[3Speak] Thumbnail update failed: ${res.status} ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Link video to Hive post — enables 3Speak special feeds (Shorts, etc.)
// ---------------------------------------------------------------------------

/**
 * Links an uploaded video to a published Hive post/comment.
 * Called after the Hive broadcast succeeds. Fire-and-forget is fine
 * since this is a non-critical metadata update.
 */
export async function linkVideoToHive(params: {
  videoPermlink: string;
  hiveAuthor: string;
  hivePermlink: string;
  hiveTags?: string[];
  accessToken: string;
}): Promise<void> {
  try {
    const res = await fetch(`${Config.ECENCY_BACKEND_API}/api/threespeak/link-hive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permlink: params.videoPermlink,
        hive_author: params.hiveAuthor,
        hive_permlink: params.hivePermlink,
        hive_tags: params.hiveTags,
        code: params.accessToken,
      }),
    });

    if (!res.ok) {
      console.error(`[3Speak] Hive link failed: ${res.status}`);
    }
  } catch (e) {
    // Non-critical — video still works, just won't appear in 3Speak feeds
    console.error('[3Speak] linkVideoToHive error:', e);
  }
}
