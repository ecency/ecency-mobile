export interface AnnouncementActionData {
  button_link?: string;
  ops?: string;
}

export type AnnouncementAction = { type: 'open-link'; url: string } | { type: 'none' };

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
