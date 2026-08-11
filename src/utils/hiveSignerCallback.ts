export interface HiveSignerSignResult {
  /** The signed transaction id, when HiveSigner handed one back. */
  id?: string;
  blockNum?: number;
  trxNum?: number;
}

/**
 * Read the outcome of a HiveSigner hot-signing session off a WebView navigation.
 *
 * HiveSigner resolves the configured callback with `sig`, `id`, `block` and `txn`
 * (see its sign page), so the callback navigation is where the transaction id lives.
 * The SDK gates `recordActivity` on that id, so losing it means the action earns no
 * points and never shows up in quest progress.
 *
 * Returns null when the url says nothing about the outcome. The two legacy shapes are
 * still recognised so a session that somehow lands on them is not treated as a
 * cancellation, they just carry no transaction id.
 */
export const parseHiveSignerSignResult = (
  url: string | undefined | null,
  redirectUri: string,
): HiveSignerSignResult | null => {
  if (!url) {
    return null;
  }

  if (url.startsWith(redirectUri)) {
    try {
      const params = new URL(url).searchParams;
      const id = params.get('id');
      if (!id) {
        return null;
      }

      const blockNum = Number(params.get('block'));
      const trxNum = Number(params.get('txn'));

      return {
        id,
        blockNum: Number.isFinite(blockNum) && blockNum > 0 ? blockNum : undefined,
        trxNum: Number.isFinite(trxNum) && trxNum > 0 ? trxNum : undefined,
      };
    } catch (error) {
      return null;
    }
  }

  if (url.includes('/sign/success')) {
    return {};
  }

  try {
    if (new URL(url).searchParams.get('success') === 'true') {
      return {};
    }
  } catch (error) {
    if (url.includes('?success=true')) {
      return {};
    }
  }

  return null;
};
