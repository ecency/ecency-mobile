// i.ecency.com is the same imagehoster backend as images.ecency.com, on an
// SNI-resilient hostname (some ISPs, e.g. Virgin Media UK, SNI-filter the
// images.ecency.com hostname). See vision-next PR #791.
export const DEFAULT_IMAGE_SERVER = 'https://i.ecency.com';

export const IMAGE_SERVERS = [
  DEFAULT_IMAGE_SERVER,
  'https://images.hive.blog',
  'https://img.ecency.com',
];

export const IMAGE_SERVER_LABELS = [
  'settings.image_server_default',
  'settings.image_server_hiveblog',
  'settings.image_server_nocdn',
];

export default IMAGE_SERVERS;
