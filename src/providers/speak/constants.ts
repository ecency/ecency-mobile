/** Ecency backend base — used to reach the 3Speak proxy routes. */
export { default as Config } from 'react-native-config';

/** Default embed endpoint (fallback if proxy doesn't return upload_url). */
export const EMBED_ENDPOINT = 'https://embed.3speak.tv';

// The 3Speak beneficiary account and weight now live in @ecency/sdk, so the web app and
// this one cannot drift on a payout value.
