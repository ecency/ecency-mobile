import { resolveAnnouncementAction } from './announcementAction';

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
