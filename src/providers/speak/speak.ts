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
 * Flow:
 * 1. Request a short-lived upload token from the Ecency proxy.
 * 2. Upload the file via the TUS resumable protocol.
 * 3. Read the embed URL from the `x-embed-url` response header.
 * 4. Return { embedUrl, permlink }.
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

  // Adaptive chunking + parallelism (TUS Concatenation extension).
  const { chunkSize, parallelUploads } = getUploadTuning(media.size);

  try {
    return await uploadOnce(
      file,
      owner,
      accessToken,
      isShort,
      chunkSize,
      parallelUploads,
      progressCallback,
    );
  } catch (err) {
    if (parallelUploads > 1) {
      // Parallel uploads require the 3Speak tusd backend to support the
      // Concatenation extension AND return X-Embed-URL on the final concat
      // response. If that doesn't hold, retry once on the proven sequential
      // path (with a fresh token) rather than failing the upload.
      console.warn('[3Speak] Parallel upload failed; retrying sequentially.', err);
      progressCallback(0);
      return uploadOnce(file, owner, accessToken, isShort, chunkSize, 1, progressCallback);
    }
    throw err;
  }
}

/**
 * Perform a single TUS upload attempt with an explicit chunk size / parallelism.
 * Obtains a fresh short-lived upload token, then uploads directly to 3Speak.
 */
async function uploadOnce(
  file: any,
  owner: string,
  accessToken: string,
  isShort: boolean,
  chunkSize: number,
  parallelUploads: number,
  progressCallback: (percentage: number) => void,
): Promise<VideoUploadResult> {
  const { token, upload_url } = await requestUploadToken(owner, accessToken, isShort);
  const endpoint = upload_url || `${EMBED_ENDPOINT}/uploads`;

  return new Promise<VideoUploadResult>((resolve, reject) => {
    // With parallelUploads the partial creation responses each carry their own
    // X-Embed-URL; the canonical one is on the final concatenation request
    // (Upload-Concat: final). Prefer it, falling back to the last-seen URL so
    // the sequential path (parallelUploads = 1) keeps its previous behaviour.
    let embedUrl = '';
    let finalEmbedUrl = '';

    const upload = new tus.Upload(file, {
      endpoint,
      chunkSize,
      parallelUploads,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        Authorization: `Bearer ${token}`,
      },
      metadata: {
        filename: file.name,
      },
      onError(error: Error) {
        // Stop any still-in-flight parallel parts so they don't keep uploading
        // while the caller retries sequentially.
        upload.abort().catch(() => {});
        reject(error);
      },
      onProgress(bytesUploaded: number, bytesTotal: number) {
        const percentage = Number(((bytesUploaded / bytesTotal) * 100).toFixed(2));
        progressCallback(percentage);
      },
      onSuccess() {
        // The canonical embed URL is the one returned by the final
        // concatenation request (Upload-Concat: final). In parallel mode we
        // REQUIRE it: partial creation responses carry their own non-canonical
        // URLs, so falling back to one would link the post to a transient
        // partial resource. The sequential path has no concat step, so the
        // last-seen URL (the final PATCH) is canonical and used as the fallback.
        if (parallelUploads > 1 && !finalEmbedUrl) {
          reject(
            new Error(
              '[3Speak] Parallel upload finished without an X-Embed-URL on the final concatenation ' +
                'response; refusing to fall back to a partial-upload URL.',
            ),
          );
          return;
        }
        const resolvedUrl = finalEmbedUrl || embedUrl;
        if (resolvedUrl) {
          const permlink = extractPermlink(resolvedUrl);
          if (!permlink) {
            reject(new Error('[3Speak] Upload succeeded but permlink could not be extracted'));
            return;
          }
          resolve({ embedUrl: resolvedUrl, permlink });
        } else {
          reject(new Error('[3Speak] Upload succeeded but no embed URL was returned'));
        }
      },
      onAfterResponse(req: any, res: any) {
        const headerUrl = res.getHeader?.('x-embed-url') || res.getHeader?.('X-Embed-URL');
        if (!headerUrl) {
          return;
        }
        // Prefer the embed URL from the final concatenation request; partial
        // creation responses (Upload-Concat: partial) may carry their own.
        const concat = String(req.getHeader?.('Upload-Concat') ?? '');
        if (concat.startsWith('final')) {
          finalEmbedUrl = headerUrl;
        }
        embedUrl = headerUrl;
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
