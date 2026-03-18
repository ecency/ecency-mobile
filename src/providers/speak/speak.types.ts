/** Result returned after a successful video upload via the new embed architecture. */
export interface VideoUploadResult {
  /** Full 3Speak embed URL, e.g. https://play.3speak.tv/embed?v=owner/permlink */
  embedUrl: string;
  /** Video permlink extracted from the embed URL */
  permlink: string;
}

/** Shape returned by the upload-token proxy. */
export interface UploadTokenResponse {
  token: string;
  upload_url?: string;
}
