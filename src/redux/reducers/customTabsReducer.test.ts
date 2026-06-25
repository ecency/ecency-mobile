import customTabsReducer from './customTabsReducer';
import { setWaveTags } from '../actions/customTabsAction';
import { DEFAULT_FEED_FILTERS } from '../../constants/options/filters';

describe('customTabsReducer - waveTags', () => {
  it('defaults waveTags to an empty array and leaves other tabs untouched', () => {
    const state = customTabsReducer(undefined, { type: '@@INIT' } as any);
    expect(state.waveTags).toEqual([]);
    expect(state.mainTabs).toEqual(DEFAULT_FEED_FILTERS);
  });

  it('sets waveTags from setWaveTags without affecting other tabs', () => {
    const prev = customTabsReducer(undefined, { type: '@@INIT' } as any);
    const next = customTabsReducer(prev, setWaveTags(['hive', 'photography']));
    expect(next.waveTags).toEqual(['hive', 'photography']);
    expect(next.mainTabs).toEqual(prev.mainTabs);
  });

  it('replaces waveTags on a subsequent dispatch', () => {
    let state = customTabsReducer(undefined, setWaveTags(['a', 'b']));
    state = customTabsReducer(state, setWaveTags(['c']));
    expect(state.waveTags).toEqual(['c']);
  });
});
