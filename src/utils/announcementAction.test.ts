import { isProposalAnnouncement, resolveAnnouncementAction } from './announcementAction';

const toUrl = (link: string) => `https://ecency.com${link}`;

describe('resolveAnnouncementAction', () => {
  it('ignores the server ops blob and falls through to button_link', () => {
    expect(
      resolveAnnouncementAction(
        { ops: 'hive://sign/op/abc', button_link: '/proposals/379' },
        toUrl,
      ),
    ).toEqual({ type: 'open-link', url: 'https://ecency.com/proposals/379' });
  });

  it('returns none when only ops is present (ops is never signed from a banner)', () => {
    expect(resolveAnnouncementAction({ ops: 'hive://sign/op/abc' }, toUrl)).toEqual({
      type: 'none',
    });
  });

  it('uses an absolute https button_link as-is', () => {
    expect(resolveAnnouncementAction({ button_link: 'https://ecency.com/mobile' }, toUrl)).toEqual({
      type: 'open-link',
      url: 'https://ecency.com/mobile',
    });
  });

  it('converts a relative button_link via toUrl', () => {
    expect(resolveAnnouncementAction({ button_link: '/created/x' }, toUrl)).toEqual({
      type: 'open-link',
      url: 'https://ecency.com/created/x',
    });
  });

  it('returns none for an empty announcement', () => {
    expect(resolveAnnouncementAction({}, toUrl)).toEqual({ type: 'none' });
  });
});

describe('isProposalAnnouncement', () => {
  it('is true when proposal_ids has at least one id', () => {
    expect(isProposalAnnouncement({ proposal_ids: [379] })).toBe(true);
  });

  it('is false for an empty proposal_ids array', () => {
    expect(isProposalAnnouncement({ proposal_ids: [] })).toBe(false);
  });

  it('is false when proposal_ids is absent (plain link announcement)', () => {
    expect(isProposalAnnouncement({ button_link: '/created/x' })).toBe(false);
  });

  it('is false for an empty announcement or undefined', () => {
    expect(isProposalAnnouncement({})).toBe(false);
    expect(isProposalAnnouncement(undefined)).toBe(false);
  });
});
