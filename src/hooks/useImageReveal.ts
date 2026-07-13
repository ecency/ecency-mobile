import { useCallback, useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';
import { selectHidePostsThumbnails } from '../redux/selectors';
import { isImageRevealed, revealImage, subscribeToRevealedImages } from '../utils/revealedImages';

/**
 * Gates a single content image behind the "Show Images" setting.
 *
 * `isHidden` is true when the setting is off and the user has not tapped this
 * particular image yet. Callers must not mount the image component at all while
 * it is true, otherwise the bytes are fetched despite the setting.
 */
export const useImageReveal = (imgUrl?: string) => {
  const isHideImages = useSelector(selectHidePostsThumbnails);

  const isRevealed = useSyncExternalStore(
    subscribeToRevealedImages,
    // Snapshot is a boolean scoped to this url, so revealing one image does not
    // re-render every other image on screen.
    () => isImageRevealed(imgUrl),
  );

  const reveal = useCallback(() => revealImage(imgUrl), [imgUrl]);

  // Nothing to hide (and nothing to reveal) without a url.
  return { isHidden: !!imgUrl && isHideImages && !isRevealed, reveal };
};
