import { SheetManager } from 'react-native-actions-sheet';
import { SheetNames } from '../navigation/sheets';
import { getItemFromStorage, setItemToStorage } from '../storage/storage';
import { store } from '../redux/store/store';
import { selectCurrentAccount } from '../redux/selectors';

/**
 * One-time own-digest offer after the account's FIRST root publish
 * (vision-mobile#3518; web analog gates on post_count === 0 at publish time).
 */
export const firstPublishDigestKey = (username: string) => `first_publish_digest_${username}`;

/**
 * Whether the offer applies. currentAccount can be a truthy-but-partial object
 * before the chain account loads, so a missing post_count means "don't know"
 * and the answer is no — never prompt on uncertainty.
 */
export const shouldOfferFirstPublishDigest = (
  postCount: unknown,
  alreadyOffered: boolean,
): boolean => !alreadyOffered && typeof postCount === 'number' && postCount === 0;

/**
 * Offers the own-notifications digest once, right after the first publish. The
 * flag is written BEFORE the sheet shows so a crash or kill can never
 * re-prompt; the sheet lives in the global SheetProvider, so it survives the
 * editor's navigation.replace. Fire-and-forget: publishing must never fail or
 * wait on this.
 */
export const maybeOfferFirstPublishDigest = async (
  username: string | undefined,
  postCount: unknown,
): Promise<void> => {
  if (!username) {
    return;
  }
  try {
    // The offer fires on a delay after publish; an account switch or logout in
    // that window must not open the sheet for the previous username. Checked at
    // fire time against the live store, and skipped WITHOUT writing the flag.
    const activeName = selectCurrentAccount(store.getState())?.name;
    if (activeName !== username) {
      return;
    }
    const flag = await getItemFromStorage(firstPublishDigestKey(username));
    if (!shouldOfferFirstPublishDigest(postCount, !!flag)) {
      return;
    }
    await setItemToStorage(firstPublishDigestKey(username), {
      offeredAt: new Date().toISOString(),
    });
    SheetManager.show(SheetNames.NEWSLETTER_DIGEST, {
      payload: { type: 'own', target: username, firstPublish: true },
    });
  } catch (err) {
    console.warn('first-publish digest offer failed', err);
  }
};
