/** Ecency backend base — used to reach the 3Speak proxy routes. */
export { default as Config } from 'react-native-config';

/** Default embed endpoint (fallback if proxy doesn't return upload_url). */
export const EMBED_ENDPOINT = 'https://embed.3speak.tv';

/** 3Speak beneficiary account for the new embed architecture. */
export const THREESPEAK_BENEFICIARY_ACCOUNT = 'threespeakfund';

/** 3Speak beneficiary weight: 11 % */
export const THREESPEAK_BENEFICIARY_WEIGHT = 1100;
