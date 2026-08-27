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
