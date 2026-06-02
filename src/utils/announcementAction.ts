export interface AnnouncementActionData {
  button_link?: string;
  ops?: string;
  proposal_ids?: number[];
}

export type AnnouncementAction = { type: 'open-link'; url: string } | { type: 'none' };

/**
 * Whether an announcement is a Hive proposal-support prompt.
 *
 * Proposal voting is handled natively on mobile by the in-feed
 * `ProposalVoteRequest` card, which casts the vote in-app (within navigation,
 * so PIN / HiveSigner / HiveAuth signing works). The announcement banner mounts
 * ABOVE the navigation container and can't run that flow — it could only open
 * the proposal web page in an in-app browser, a redundant and worse path. So we
 * detect proposal announcements here and skip the banner for them, letting the
 * native card own the experience. Mirrors the web discriminator
 * (`proposal_ids?.length > 0`), which there votes inline instead.
 */
export const isProposalAnnouncement = (data?: AnnouncementActionData): boolean => {
  const ids = data?.proposal_ids;
  return Array.isArray(ids) && ids.length > 0;
};

/**
 * Decide what an announcement's primary button does.
 *
 * The server-provided `ops` (`hive://sign/op/...`) blob is intentionally ignored:
 * a banner tap must never sign an arbitrary server-supplied operation. We only
 * open `button_link` (e.g. a proposal page, where voting happens through the
 * in-app, user-reviewed flow) — or do nothing when there is no link.
 *
 * Note: proposal voting is NOT triggered inline here. The announcement is shown
 * above the navigation container (from app init), whereas the vote/signing flow
 * requires navigation context — so an inline vote can't run from this surface.
 */
export const resolveAnnouncementAction = (
  data: AnnouncementActionData,
  toUrl: (link: string) => string,
): AnnouncementAction => {
  if (data?.button_link) {
    const url = data.button_link.startsWith('https://')
      ? data.button_link
      : toUrl(data.button_link);
    return { type: 'open-link', url };
  }

  return { type: 'none' };
};
