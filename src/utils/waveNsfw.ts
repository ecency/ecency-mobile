/**
 * Should a wave be left out of a list because the waves API flagged it?
 *
 * The API sets `nsfw: true` on a wave when its image check found an explicit
 * picture or the author tagged the wave `nsfw`. It already leaves such waves out
 * of the shared feeds; they still arrive on the per-author feed (the profile
 * waves tab), which is where this applies.
 *
 * - "always show" ('0') keeps everything.
 * - Any other setting drops the wave. Waves render through the comment list,
 *   which has no warning placeholder, so "always warn" hides here too rather
 *   than showing the picture.
 * - The viewer's own wave always stays: they posted it, and a wave missing from
 *   their own profile would read as lost.
 *
 * Only the boolean is read. A missing flag is not a verdict.
 */
export const NSFW_ALWAYS_SHOW = '0';

interface MaybeFlaggedWave {
  nsfw?: unknown;
  author?: string;
}

export const isWaveHiddenForNsfw = (
  wave: MaybeFlaggedWave | null | undefined,
  nsfwSetting: string | undefined,
  viewer?: string | null,
): boolean => {
  if (!wave || wave.nsfw !== true) {
    return false;
  }
  if (nsfwSetting === NSFW_ALWAYS_SHOW) {
    return false;
  }
  return !(viewer && wave.author === viewer);
};
