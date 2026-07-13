import {
  clearRevealedImages,
  isImageRevealed,
  revealImage,
  subscribeToRevealedImages,
} from './revealedImages';

const URL_A = 'https://images.ecency.com/p/a.jpg';
const URL_B = 'https://images.ecency.com/p/b.jpg';

describe('revealedImages', () => {
  beforeEach(() => clearRevealedImages());

  it('tracks reveals per url', () => {
    expect(isImageRevealed(URL_A)).toBe(false);
    revealImage(URL_A);
    expect(isImageRevealed(URL_A)).toBe(true);
    expect(isImageRevealed(URL_B)).toBe(false);
  });

  it('treats a missing url as never revealed', () => {
    revealImage(undefined);
    expect(isImageRevealed(undefined)).toBe(false);
    expect(isImageRevealed('')).toBe(false);
  });

  it('notifies subscribers when an image is revealed', () => {
    const listener = jest.fn();
    subscribeToRevealedImages(listener);

    revealImage(URL_A);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not notify when revealing an already-revealed image', () => {
    revealImage(URL_A);

    const listener = jest.fn();
    subscribeToRevealedImages(listener);
    revealImage(URL_A);

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeToRevealedImages(listener);
    unsubscribe();

    revealImage(URL_A);
    expect(listener).not.toHaveBeenCalled();
  });

  it('forgets everything on clear, so a fresh session downloads nothing unasked', () => {
    revealImage(URL_A);
    clearRevealedImages();
    expect(isImageRevealed(URL_A)).toBe(false);
  });
});
