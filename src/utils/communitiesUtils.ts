import { SubscribedCommunity } from '../redux/reducers/cacheReducer';

/**
 * Accepts Array of subscription items arrays as 1st argument, community cache map as second argument.
 * Returns single array with union of both lists, sorted alphabatically
 * Example subList = [['id', 'title', 'role', 'label', 'true/false'],['id', 'title', 'role', 'label', 'true/false']]
 *
 **/
export const mergeSubCommunitiesCacheInSubList = (
  subList: any[],
  cacheMap: Map<string, SubscribedCommunity>,
) => {
  if (!cacheMap || !cacheMap.size) {
    return subList.sort((a, b) => a[1].localeCompare(b[1]));
  }
  const cacheList = Array.from(cacheMap, ([path, item]) => item.data);
  cacheList.map((cacheListItem) => {
    let index = subList.findIndex((subListItem) => subListItem[0] === cacheListItem[0]);
    if (index !== -1) {
      subList[index] = [...cacheListItem];
    } else {
      subList.push(cacheListItem);
    }
  });
  return subList.sort((a, b) => a[1].localeCompare(b[1]));
};
