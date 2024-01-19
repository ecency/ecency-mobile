import { SubscribedCommunity } from '../redux/reducers/cacheReducer';

/**
 * Accepts Array of subscription items arrays as 1st argument, community cache map as second argument.
 * Returns single array with union of both lists, sorted alphabatically
 * Example subList = [['id', 'title', 'role', 'label', 'true/false'],['id', 'title', 'role', 'label', 'true/false']]
 *
 * */
export const mergeSubCommunitiesCacheInSubList = (
  subList: any[],
  cacheMap: Map<string, SubscribedCommunity>,
) => {
  if (!cacheMap || !cacheMap.size) {
    return subList.sort((a, b) => a[1].localeCompare(b[1]));
  }
  const cacheList = Array.from(cacheMap, ([, item]) => item.data);
  cacheList.forEach((cacheListItem) => {
    const index = subList.findIndex((subListItem) => subListItem[0] === cacheListItem[0]);
    if (index !== -1) {
      subList[index] = [...cacheListItem];
    } else {
      subList.push(cacheListItem);
    }
  });
  return subList.sort((a, b) => a[1].localeCompare(b[1]));
};

/**
 * Accepts Array of discover items arrays as 1st argument, community cache map as second argument.
 * Returns discovers list with updated isSubscribed status
 *
 * */
export const mergeSubCommunitiesCacheInDiscoverList = (
  discoverList: any[],
  cacheMap: Map<string, SubscribedCommunity>,
) => {
  if (!cacheMap || !cacheMap.size) {
    return discoverList;
  }
  discoverList.forEach((discoverListItem) => {
    const itemExist = cacheMap.get(discoverListItem.name);
    if (itemExist) {
      [, , , , discoverListItem.isSubscribed] = itemExist.data;
    }
  });
  return discoverList;
};
