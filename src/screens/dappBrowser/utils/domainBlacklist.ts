/**
 * Static blacklist of known Hive phishing/scam domains.
 * Checked before showing the keychain confirmation sheet.
 *
 * Sourced from Hive Keychain's public blacklist and community reports.
 * Update periodically as new phishing domains are discovered.
 */
const BLACKLISTED_DOMAINS: string[] = [
  'leofinance-mainnet.blogspot.com',
  'leodefi.blogspot.com',
  'leodefii.blogspot.com',
  'defiairdrop.ml',
  'leomainet.blogspot.com',
  'appicslaunch.blogspot.com',
  'softlaunch.appics.com',
  'honulover.club',
  'horia69xl.monster',
  'leofinance-steem.web.app',
  'leofinance-witness.web.app',
  'witness-vote.web.app',
  'witness-voting.pqr.app',
  'security-alert-portal.web.app',
  '6854712547.site',
  'lokin69xtr.club',
  'moris69bukail.cyou',
  'hisksexyl.monster',
  'localsexyladies1.com',
  'por69sex.buzz',
  'gosex69.work',
  'atomichub.in',
  '5486-5487.live',
  'love69date.top',
  'jharodatex.icu',
  'promislove.monster',
  'jhigolove69.click',
  'jhindatex.cyou',
  '54896-78481.live',
  'harnightx.icu',
  'jmrlove69x.cyou',
  'jaro69fuck.top',
  '54897-78457.live',
  'peypaisecurity.com',
  'fisranilove.lol',
  'loyalty.reward-hive.blog',
];

const _blacklistSet = new Set(BLACKLISTED_DOMAINS);

/**
 * Check if a domain or URL is blacklisted.
 * Returns the matched domain string if blacklisted, or null if safe.
 */
export function checkDomainBlacklist(urlOrHostname: string): string | null {
  let hostname: string;
  try {
    ({ hostname } = new URL(urlOrHostname));
  } catch {
    hostname = urlOrHostname;
  }

  // Strip www. prefix
  hostname = hostname.replace(/^www\./, '');

  if (_blacklistSet.has(hostname)) {
    return hostname;
  }

  // Also check if any blacklisted domain is a suffix (subdomain match)
  const match = BLACKLISTED_DOMAINS.find((blocked) => hostname.endsWith(`.${blocked}`));
  return match || null;
}
