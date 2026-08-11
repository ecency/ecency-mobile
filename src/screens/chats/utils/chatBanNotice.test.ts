import {
  BAN_NOTICE_TICK_MS,
  formatBanRemaining,
  formatChatBanNotice,
  getChatBanInfo,
} from './chatBanNotice';

// Stands in for react-intl's formatMessage: returns defaultMessage with {placeholder} filled,
// which is what the real one does for these descriptors.
const fmt = (
  descriptor: { id: string; defaultMessage: string },
  values?: Record<string, string | number>,
) => {
  let out = descriptor.defaultMessage;
  Object.entries(values || {}).forEach(([k, v]) => {
    out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  });
  return out;
};

const NOW = 1_800_000_000_000;
const mins = (n: number) => NOW + n * 60_000;
const hours = (n: number) => NOW + n * 3_600_000;
const days = (n: number) => NOW + n * 86_400_000;

describe('getChatBanInfo', () => {
  it('extracts a live ban from the thrown error', () => {
    expect(getChatBanInfo({ bannedUntil: hours(48), reason: 'spray' }, NOW)).toEqual({
      bannedUntil: hours(48),
      reason: 'spray',
    });
  });

  it('ignores an expired ban', () => {
    expect(getChatBanInfo({ bannedUntil: NOW - 1 }, NOW)).toBeNull();
  });

  it('returns null for ordinary failures', () => {
    expect(getChatBanInfo(new Error('network'), NOW)).toBeNull();
    expect(getChatBanInfo(null, NOW)).toBeNull();
  });

  it('tolerates a ban with no reason, so older servers still work', () => {
    expect(getChatBanInfo({ bannedUntil: hours(1) }, NOW)?.reason).toBeUndefined();
  });

  it('rejects a non-finite expiry', () => {
    // Infinity survives an isNaN check and is also > now, so both original guards passed it.
    // The banner would then show an endless duration and never fire onExpire.
    expect(getChatBanInfo({ bannedUntil: Infinity }, NOW)).toBeNull();
    expect(getChatBanInfo({ bannedUntil: 'Infinity' }, NOW)).toBeNull();
    expect(getChatBanInfo({ bannedUntil: -Infinity }, NOW)).toBeNull();
    expect(getChatBanInfo({ bannedUntil: 'not-a-number' }, NOW)).toBeNull();
  });

  it('drops a non-string reason rather than rendering it', () => {
    expect(
      getChatBanInfo({ bannedUntil: hours(1), reason: { a: 1 } }, NOW)?.reason,
    ).toBeUndefined();
  });
});

describe('formatBanRemaining', () => {
  it('scales the unit to the magnitude', () => {
    expect(formatBanRemaining(mins(30), NOW, fmt)).toContain('30 minutes');
    expect(formatBanRemaining(hours(5), NOW, fmt)).toContain('5 hours');
    expect(formatBanRemaining(days(2), NOW, fmt)).toContain('2 days');
  });

  it('never promises an unlock that has not happened', () => {
    expect(formatBanRemaining(NOW + 30_000, NOW, fmt)).toBe('in under a minute');
    expect(formatBanRemaining(NOW - 10_000, NOW, fmt)).toBe('in under a minute');
  });

  it('never phrases a count as 1', () => {
    [mins(59), mins(89), hours(1), hours(2), days(1), days(400)].forEach((until) => {
      const match = formatBanRemaining(until, NOW, fmt).match(/about (\d+)/);
      if (match) {
        expect(Number(match[1])).toBeGreaterThanOrEqual(2);
      }
    });
  });

  it('renders a multi-year ban as days rather than degrading', () => {
    expect(formatBanRemaining(NOW + 3 * 365 * 86_400_000, NOW, fmt)).toContain('1095 days');
  });
});

describe('formatChatBanNotice', () => {
  it('explains a spray timeout', () => {
    const text = formatChatBanNotice({ bannedUntil: hours(48), reason: 'spray' }, NOW, fmt);
    expect(text).toContain('same message went to several channels');
    expect(text).toContain('You can still read chat.');
    expect(text).toContain('2 days');
  });

  it('explains a mass-DM ban differently', () => {
    const text = formatChatBanNotice({ bannedUntil: days(365), reason: 'mass-dm' }, NOW, fmt);
    expect(text).toContain('many people at once');
  });

  it('falls back to generic copy for manual and unrecognised reasons', () => {
    ['manual', 'reason-from-a-newer-service', undefined].forEach((reason) => {
      const text = formatChatBanNotice({ bannedUntil: hours(3), reason }, NOW, fmt);
      expect(text).toContain('paused from posting');
      expect(text).toContain('3 hours');
    });
  });

  it('never shows operator-facing detail to the banned user', () => {
    const text = formatChatBanNotice({ bannedUntil: hours(48), reason: 'spray' }, NOW, fmt);
    expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(text).not.toContain('ecency_chat');
    expect(text).not.toContain('@');
  });
});

describe('BAN_NOTICE_TICK_MS', () => {
  it('stays inside the 32-bit setTimeout limit', () => {
    // A delay derived from bannedUntil overflows for long bans and fires almost immediately,
    // which would clear the notice for exactly the users who are most banned.
    expect(BAN_NOTICE_TICK_MS).toBeGreaterThan(0);
    expect(BAN_NOTICE_TICK_MS).toBeLessThan(2_147_483_647);
  });
});
