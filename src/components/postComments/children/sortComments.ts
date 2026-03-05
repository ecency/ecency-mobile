export const sortComments = (sortOrder = 'trending', _comments, pinnedReply?: string) => {
  if (!Array.isArray(_comments) || _comments.length === 0) {
    return _comments;
  }

  const absNegative = (a) => a.net_rshares < 0;

  const sortOrders = {
    trending: (a, b) => {
      if (a.renderOnTop && !b.renderOnTop) {
        return -1;
      }
      if (!a.renderOnTop && b.renderOnTop) {
        return 1;
      }

      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const apayout = a.total_payout;
      const bpayout = b.total_payout;

      if (apayout !== bpayout) {
        return bpayout - apayout;
      }

      return 0;
    },
    reputation: (a, b) => {
      if (a.renderOnTop && !b.renderOnTop) {
        return -1;
      }
      if (!a.renderOnTop && b.renderOnTop) {
        return 1;
      }

      const keyA = a.author_reputation;
      const keyB = b.author_reputation;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    votes: (a, b) => {
      if (a.renderOnTop && !b.renderOnTop) {
        return -1;
      }
      if (!a.renderOnTop && b.renderOnTop) {
        return 1;
      }

      const keyA = a.active_votes.length;
      const keyB = b.active_votes.length;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    age: (a, b) => {
      if (a.renderOnTop && !b.renderOnTop) {
        return -1;
      }
      if (!a.renderOnTop && b.renderOnTop) {
        return 1;
      }

      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const keyA = Date.parse(a.created);
      const keyB = Date.parse(b.created);

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
  };

  const sorter = sortOrders[sortOrder] || sortOrders.trending;

  // Check if array is already sorted to avoid creating new array
  let needsSort = false;
  for (let i = 0; i < _comments.length - 1; i++) {
    if (sorter(_comments[i], _comments[i + 1]) > 0) {
      needsSort = true;
      break;
    }
  }

  if (!needsSort && !pinnedReply) {
    return _comments;
  }

  if (!needsSort && pinnedReply) {
    // No sort needed but pinned reply must be moved to front
    const pinnedIndex = _comments.findIndex((c) => `${c.author}/${c.permlink}` === pinnedReply);
    if (pinnedIndex > 0) {
      const result = [..._comments];
      const [pinned] = result.splice(pinnedIndex, 1);
      result.unshift(pinned);
      return result;
    }
    return _comments;
  }

  // Only create new array if sorting is needed
  const sortedComments = [..._comments];
  sortedComments.sort(sorter);

  // Move pinned reply to the front (matches web SDK sortDiscussions pattern)
  if (pinnedReply) {
    const pinnedIndex = sortedComments.findIndex(
      (c) => `${c.author}/${c.permlink}` === pinnedReply,
    );
    if (pinnedIndex > 0) {
      const [pinned] = sortedComments.splice(pinnedIndex, 1);
      sortedComments.unshift(pinned);
    }
  }

  return sortedComments;
};
