import { createTimeoutReason } from './abortSignalPolyfill';

describe('createTimeoutReason', () => {
  it('carries TimeoutError as its name, not as its message', () => {
    // providers/hive/hive.ts, upvotePopover and @ecency/sdk all branch on
    // `err.name === 'TimeoutError'`. An Error whose message happens to read
    // 'TimeoutError' has name 'Error' and matches none of them, so a timed-out
    // Hive read would be treated as an unknown failure.
    const reason = createTimeoutReason();

    expect(reason.name).toBe('TimeoutError');
    expect(reason).toBeInstanceOf(Error);
  });
});
