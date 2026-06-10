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
  /**
   * Video permlink assigned by the backend at token issuance. When present the
   * client knows the embed URL before uploading, so it never needs to read the
   * X-Embed-URL response header (unreliable for parallel/Concatenation uploads).
   */
  permlink?: string;
  /** Canonical embed URL, returned alongside `permlink` by newer backends. */
  embed_url?: string;
}
