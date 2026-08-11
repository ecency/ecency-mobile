import { cancelQuestsRefresh, QUESTS_REFRESH_DELAY, scheduleQuestsRefresh } from './refreshQuests';

jest.mock('@ecency/sdk', () => ({
  QueryKeys: {
    quests: { status: (username?: string) => ['quests', 'status', username] },
  },
}));

const invalidateQueries = jest.fn();
const queryClient = { invalidateQueries } as any;

describe('scheduleQuestsRefresh', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    invalidateQueries.mockClear();
  });

  afterEach(() => {
    cancelQuestsRefresh();
    jest.useRealTimers();
  });

  it('waits for the backend to actually credit the action before refetching', () => {
    scheduleQuestsRefresh(queryClient, 'alice');

    // A chain action is verified and processed a little over a minute after it is
    // broadcast. Asking sooner reads the pre-action numbers and then marks them
    // fresh, so the real update is never picked up.
    jest.advanceTimersByTime(10 * 1000);
    expect(invalidateQueries).not.toHaveBeenCalled();

    jest.advanceTimersByTime(QUESTS_REFRESH_DELAY);
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['quests', 'status', 'alice'],
    });
  });

  it('coalesces a burst of actions into one request', () => {
    scheduleQuestsRefresh(queryClient, 'alice');
    jest.advanceTimersByTime(5 * 1000);
    scheduleQuestsRefresh(queryClient, 'alice');
    jest.advanceTimersByTime(5 * 1000);
    scheduleQuestsRefresh(queryClient, 'alice');

    jest.advanceTimersByTime(QUESTS_REFRESH_DELAY + 1000);
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
  });

  it('strips a leading @ so the key matches the query', () => {
    scheduleQuestsRefresh(queryClient, '@alice');
    jest.advanceTimersByTime(QUESTS_REFRESH_DELAY + 1000);

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['quests', 'status', 'alice'],
    });
  });

  it('does nothing without a username', () => {
    scheduleQuestsRefresh(queryClient, undefined);
    scheduleQuestsRefresh(queryClient, null);
    scheduleQuestsRefresh(queryClient, '');
    jest.advanceTimersByTime(QUESTS_REFRESH_DELAY + 1000);

    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
