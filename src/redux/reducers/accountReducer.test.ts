import accountReducer from './accountReducer';
import {
  FETCHING_ACCOUNT,
  FETCH_ACCOUNT_FAIL,
  ADD_OTHER_ACCOUNT,
  UPDATE_OTHER_ACCOUNT,
  UPDATE_CURRENT_ACCOUNT,
  UPDATE_UNREAD_ACTIVITY_COUNT,
  REMOVE_OTHER_ACCOUNT,
  REMOVE_ALL_OTHER_ACCOUNT,
  LOGOUT_FAIL,
  SET_GLOBAL_PROPS,
  SET_PREV_LOGGED_IN_USERS,
  CLEAR_PREV_LOGGED_IN_USERS,
} from '../constants/constants';

const initialState = () => accountReducer(undefined, { type: '@@INIT' });

describe('accountReducer', () => {
  it('returns initial state', () => {
    const state = initialState();
    expect(state.otherAccounts).toEqual([]);
    expect(state.currentAccount).toEqual({});
    expect(state.hasError).toBe(false);
    expect(state.globalProps).toBeNull();
  });

  describe('FETCHING_ACCOUNT', () => {
    it('sets fetching state', () => {
      const state = accountReducer(initialState(), { type: FETCHING_ACCOUNT });
      expect(state.isFetching).toBe(true);
      expect(state.hasError).toBe(false);
    });
  });

  describe('FETCH_ACCOUNT_FAIL', () => {
    it('sets error state', () => {
      const state = accountReducer(initialState(), {
        type: FETCH_ACCOUNT_FAIL,
        payload: 'Network error',
      });
      expect(state.isFetching).toBe(false);
      expect(state.hasError).toBe(true);
      expect(state.errorMessage).toBe('Network error');
    });
  });

  describe('ADD_OTHER_ACCOUNT', () => {
    it('adds a new account', () => {
      const state = accountReducer(initialState(), {
        type: ADD_OTHER_ACCOUNT,
        payload: { username: 'alice', name: 'alice' },
      });
      expect(state.otherAccounts).toHaveLength(1);
      expect(state.otherAccounts[0].username).toBe('alice');
    });

    it('deduplicates by username — replaces existing', () => {
      let state = initialState();
      state = accountReducer(state, {
        type: ADD_OTHER_ACCOUNT,
        payload: { username: 'alice', name: 'alice', token: 'old' },
      });
      state = accountReducer(state, {
        type: ADD_OTHER_ACCOUNT,
        payload: { username: 'alice', name: 'alice', token: 'new' },
      });
      expect(state.otherAccounts).toHaveLength(1);
      expect(state.otherAccounts[0].token).toBe('new');
    });

    it('adds multiple different accounts', () => {
      let state = initialState();
      state = accountReducer(state, {
        type: ADD_OTHER_ACCOUNT,
        payload: { username: 'alice' },
      });
      state = accountReducer(state, {
        type: ADD_OTHER_ACCOUNT,
        payload: { username: 'bob' },
      });
      expect(state.otherAccounts).toHaveLength(2);
    });
  });

  describe('UPDATE_OTHER_ACCOUNT', () => {
    it('replaces account data by username', () => {
      let state = initialState();
      state = accountReducer(state, {
        type: ADD_OTHER_ACCOUNT,
        payload: { username: 'alice', data: 'old' },
      });
      state = accountReducer(state, {
        type: UPDATE_OTHER_ACCOUNT,
        payload: { username: 'alice', data: 'updated' },
      });
      expect(state.otherAccounts).toHaveLength(1);
      expect(state.otherAccounts[0].data).toBe('updated');
    });
  });

  describe('REMOVE_OTHER_ACCOUNT', () => {
    it('removes account by username', () => {
      let state = initialState();
      state = accountReducer(state, {
        type: ADD_OTHER_ACCOUNT,
        payload: { username: 'alice' },
      });
      state = accountReducer(state, {
        type: ADD_OTHER_ACCOUNT,
        payload: { username: 'bob' },
      });
      state = accountReducer(state, {
        type: REMOVE_OTHER_ACCOUNT,
        payload: 'alice',
      });
      expect(state.otherAccounts).toHaveLength(1);
      expect(state.otherAccounts[0].username).toBe('bob');
    });
  });

  describe('REMOVE_ALL_OTHER_ACCOUNT', () => {
    it('clears all other accounts', () => {
      let state = initialState();
      state = accountReducer(state, {
        type: ADD_OTHER_ACCOUNT,
        payload: { username: 'alice' },
      });
      state = accountReducer(state, { type: REMOVE_ALL_OTHER_ACCOUNT });
      expect(state.otherAccounts).toEqual([]);
    });
  });

  describe('UPDATE_CURRENT_ACCOUNT', () => {
    it('sets current account', () => {
      const state = accountReducer(initialState(), {
        type: UPDATE_CURRENT_ACCOUNT,
        payload: { name: 'alice', reputation: 70 },
      });
      expect(state.currentAccount.name).toBe('alice');
      expect(state.isFetching).toBe(false);
    });
  });

  describe('UPDATE_UNREAD_ACTIVITY_COUNT', () => {
    it('updates unread count on current account', () => {
      let state = accountReducer(initialState(), {
        type: UPDATE_CURRENT_ACCOUNT,
        payload: { name: 'alice' },
      });
      state = accountReducer(state, {
        type: UPDATE_UNREAD_ACTIVITY_COUNT,
        payload: 5,
      });
      expect(state.currentAccount.unread_activity_count).toBe(5);
      expect(state.currentAccount.name).toBe('alice');
    });
  });

  describe('SET_GLOBAL_PROPS', () => {
    it('stores global properties', () => {
      const props = {
        hivePerMVests: 500,
        base: 0.5,
        quote: 1,
        fundRecentClaims: 1e9,
        fundRewardBalance: 1000,
        votePowerReserveRate: 10,
        authorRewardCurve: 'linear',
        contentConstant: 2000000000000,
        currentHardforkVersion: '1.28.0',
        lastHardfork: 28,
        hbdPrintRate: 10000,
      };
      const state = accountReducer(initialState(), {
        type: SET_GLOBAL_PROPS,
        payload: props,
      });
      expect(state.globalProps).toEqual(props);
    });
  });

  describe('LOGOUT_FAIL', () => {
    it('sets logging out flag', () => {
      const state = accountReducer(initialState(), { type: LOGOUT_FAIL });
      expect(state.isLogingOut).toBe(true);
    });
  });

  describe('SET_PREV_LOGGED_IN_USERS / CLEAR', () => {
    it('stores previous users', () => {
      const users = [{ username: 'alice', isLoggedOut: true }];
      const state = accountReducer(initialState(), {
        type: SET_PREV_LOGGED_IN_USERS,
        payload: users,
      });
      expect(state.prevLoggedInUsers).toEqual(users);
    });

    it('clears previous users', () => {
      let state = accountReducer(initialState(), {
        type: SET_PREV_LOGGED_IN_USERS,
        payload: [{ username: 'alice', isLoggedOut: false }],
      });
      state = accountReducer(state, { type: CLEAR_PREV_LOGGED_IN_USERS });
      expect(state.prevLoggedInUsers).toEqual([]);
    });
  });
});
