// Ensures only ONE Speak voice player is audible at a time. A post and its
// comments can each render a SpeakAudioPlayer; without coordination, tapping a
// second one leaves the first playing (overlapping audio) and confuses the iOS
// now-playing/lock-screen controls. Each player registers a `stop` callback when
// it starts; activating a new one pauses the previously-active player.

type Stopper = () => void;

let activeStopper: Stopper | null = null;

export const speakPlayback = {
  /** A player started playing: pause whichever player was playing before. */
  activate(stopper: Stopper) {
    if (activeStopper && activeStopper !== stopper) {
      activeStopper();
    }
    activeStopper = stopper;
  },

  /** A player paused / ended / unmounted: clear it if it was the active one. */
  deactivate(stopper: Stopper) {
    if (activeStopper === stopper) {
      activeStopper = null;
    }
  },
};
