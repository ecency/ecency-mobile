export const reputation = reputation => {
    if (reputation == null) return reputation;
    reputation = parseInt(reputation);
    let log = Math.log10(reputation);
    log = log - 9;
    log = log * 9;
    log = log + 25;
    log = Math.floor(log);
    return log;
};
