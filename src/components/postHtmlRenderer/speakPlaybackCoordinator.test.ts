import { speakPlayback } from './speakPlaybackCoordinator';

describe('speakPlayback coordinator', () => {
  beforeEach(() => {
    // Reset the module-level active player between tests.
    const noop = () => {};
    speakPlayback.activate(noop);
    speakPlayback.deactivate(noop);
  });

  it('pauses the previously-active player when another one starts', () => {
    const a = jest.fn();
    const b = jest.fn();
    speakPlayback.activate(a);
    expect(a).not.toHaveBeenCalled();
    speakPlayback.activate(b); // b starts -> a must be paused
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
  });

  it('does not pause itself when the same player re-activates', () => {
    const a = jest.fn();
    speakPlayback.activate(a);
    speakPlayback.activate(a);
    expect(a).not.toHaveBeenCalled();
  });

  it('deactivate only clears the active slot when it owns it', () => {
    const a = jest.fn();
    const b = jest.fn();
    speakPlayback.activate(a);
    speakPlayback.deactivate(b); // b is not active -> a stays active
    speakPlayback.activate(b); // so a still gets paused now
    expect(a).toHaveBeenCalledTimes(1);
  });

  it('after the active player deactivates, the next start pauses nobody', () => {
    const a = jest.fn();
    const b = jest.fn();
    speakPlayback.activate(a);
    speakPlayback.deactivate(a); // a stops on its own
    speakPlayback.activate(b);
    expect(a).not.toHaveBeenCalled(); // a was already cleared, not re-paused
  });
});
