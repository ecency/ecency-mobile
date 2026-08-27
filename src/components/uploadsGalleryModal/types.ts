// Kept dependency-free so pure editor helpers (applyMediaLink and its tests) can
// import these without pulling in the gallery container's native module graph.
export enum Modes {
  MODE_IMAGE = 0,
  MODE_VIDEO = 1,
}

export enum MediaInsertStatus {
  UPLOADING = 'UPLOADING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export interface MediaInsertData {
  url: string;
  filename?: string;
  text: string;
  status: MediaInsertStatus;
  // absent for image inserts and failed uploads; only video inserts carry it
  mode?: Modes;
}

export interface MediaInsertContext {
  /**
   * Filenames of OTHER uploads whose "Uploading..." placeholder may still be in
   * the body when this batch is applied. The editor uses it to refuse repairing an
   * ambiguous placeholder that could belong to one of them, which would write this
   * upload's url into another image's slot.
   */
  otherPending?: string[];
}
