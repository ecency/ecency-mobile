export enum ThreeSpeakStatus {
  PUBLISHED = 'published',
  READY = 'publish_manual',
  DELETED = 'deleted',
  ENCODING = 'encoding_ipfs',
  PREPARING = 'encoding_preparing',
}

export interface ThreeSpeakVideo {
  app: string;
  beneficiaries: string; // e.g. "[{\"account\":\"actifit-he\",\"weight\":100,\"src\":\"ENCODER_PAY\"}]"
  category: string;
  community: unknown | null;
  created: string; // e.g. "2023-06-21T12:02:10.421Z"
  declineRewards: boolean;
  description: string;
  donations: boolean;
  duration: number;
  encoding: Record<number, boolean>;
  encodingProgress: number;
  encoding_price_steem: string;
  filename: string;
  firstUpload: boolean;
  fromMobile: boolean;
  height: unknown;
  hive: string;
  indexed: boolean;
  is3CJContent: boolean;
  isNsfwContent: boolean;
  isReel: boolean;
  isVOD: boolean;
  job_id: string;
  language: string;
  local_filename: string;
  lowRc: boolean;
  needsBlockchainUpdate: boolean;
  originalFilename: string;
  owner: string;
  paid: boolean;
  permlink: string;
  postToHiveBlog: boolean;
  publish_type: string;
  reducedUpvote: boolean;
  rewardPowerup: boolean;
  size: number;
  status: ThreeSpeakStatus;
  tags_v2: unknown[];
  thumbUrl: string;
  thumbnail: string;
  title: string;
  updateSteem: boolean;
  upload_type: string;
  upvoteEligible: boolean;
  video_v2: string;
  views: number;
  votePercent: number;
  width: unknown;
  __v: number;
  _id: string;
}
