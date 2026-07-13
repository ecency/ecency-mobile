/**
 * Session-scoped record of images the user explicitly tapped to load while the
 * "Show Images" setting is off.
 *
 * Deliberately not persisted: the point of the setting is that a fresh session
 * downloads nothing the user did not ask for. Keeping it in memory (rather than
 * in component state) means an image revealed in the feed stays revealed when
 * the same post is opened, and survives FlashList cell recycling.
 */
const revealedUrls = new Set<string>();
const listeners = new Set<() => void>();

export const revealImage = (imgUrl?: string) => {
  if (!imgUrl || revealedUrls.has(imgUrl)) {
    return;
  }
  revealedUrls.add(imgUrl);
  listeners.forEach((listener) => listener());
};

export const isImageRevealed = (imgUrl?: string) => !!imgUrl && revealedUrls.has(imgUrl);

export const subscribeToRevealedImages = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const clearRevealedImages = () => {
  revealedUrls.clear();
  listeners.forEach((listener) => listener());
};
