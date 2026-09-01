import {
  FCM_FOREGROUND_NOTIFICATION_TYPES,
  FOLLOW_NOTIFICATION_TYPES,
  FOREGROUND_BANNER_TYPES,
  WS_NOTIFICATION_TYPES,
} from './notificationTypes';

describe('notification type vocabularies', () => {
  it('uses the SINGULAR push spellings in the FCM list', () => {
    // push/format.py sets custom_data['type'] = 'delegation' / 'payout'. Holding the
    // websocket plurals here meant neither ever matched an FCM message.
    expect(FCM_FOREGROUND_NOTIFICATION_TYPES).toContain('delegation');
    expect(FCM_FOREGROUND_NOTIFICATION_TYPES).toContain('payout');
    expect(FCM_FOREGROUND_NOTIFICATION_TYPES).not.toContain('delegations');
    expect(FCM_FOREGROUND_NOTIFICATION_TYPES).not.toContain('payouts');
  });

  it('uses the PLURAL websocket spellings in the websocket list', () => {
    // helper.py str_activity_type() returns 'delegations' / 'payouts'.
    expect(WS_NOTIFICATION_TYPES).toContain('delegations');
    expect(WS_NOTIFICATION_TYPES).toContain('payouts');
    expect(WS_NOTIFICATION_TYPES).not.toContain('delegation');
    expect(WS_NOTIFICATION_TYPES).not.toContain('payout');
  });

  it('handles the whole follow family on both transports', () => {
    // All four share ACTIVITY_MAIN_TYPE_FOLLOW, so one toggle governs them and the
    // client has to recognise all four or they are silently dropped.
    expect(FOLLOW_NOTIFICATION_TYPES).toEqual(['follow', 'unfollow', 'ignore', 'blacklist']);

    FOLLOW_NOTIFICATION_TYPES.forEach((type) => {
      expect(WS_NOTIFICATION_TYPES).toContain(type);
    });

    // blacklist has no push template server side (format_activity returns None), so it
    // is never enqueued for FCM and must NOT be in the push list.
    ['follow', 'unfollow', 'ignore'].forEach((type) => {
      expect(FCM_FOREGROUND_NOTIFICATION_TYPES).toContain(type);
    });
    expect(FCM_FOREGROUND_NOTIFICATION_TYPES).not.toContain('blacklist');
  });

  it('keeps the two lists aligned except where the vocabularies genuinely differ', () => {
    const onlyInWs = WS_NOTIFICATION_TYPES.filter(
      (t) => !(FCM_FOREGROUND_NOTIFICATION_TYPES as readonly string[]).includes(t),
    );
    expect(onlyInWs.sort()).toEqual(['blacklist', 'delegations', 'payouts']);
  });

  it('renders a banner for every type either transport accepts', () => {
    // A type accepted upstream but missing from the banner refreshes the unread badge
    // and then shows nothing. payout, account_update and weekly_earnings were in
    // exactly that state: accepted by both allowlists, absent from the banner.
    const banner = FOREGROUND_BANNER_TYPES as readonly string[];

    const uncovered = [...FCM_FOREGROUND_NOTIFICATION_TYPES, ...WS_NOTIFICATION_TYPES]
      .filter((type) => !banner.includes(type))
      .sort();

    expect(uncovered).toEqual([]);
  });
});
