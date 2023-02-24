export const sortComments = (sortOrder = 'trending', _comments) => {
    const sortedComments: any[] = _comments;

    const absNegative = (a) => a.net_rshares < 0;

    const sortOrders = {
        trending: (a, b) => {
            if (a.renderOnTop) {
                return -1;
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
            if (a.renderOnTop) {
                return -1;
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
            if (a.renderOnTop) {
                return -1;
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
            if (a.renderOnTop) {
                return -1;
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

    sortedComments.sort(sortOrders[sortOrder]);

    return sortedComments;
};
