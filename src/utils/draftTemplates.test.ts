import { isTemplateDraft, templateDisplayName } from './draftTemplates';

describe('isTemplateDraft', () => {
  it('returns true when meta.postTemplate is truthy', () => {
    expect(isTemplateDraft({ meta: { postTemplate: true } })).toBe(true);
    expect(isTemplateDraft({ meta: { postTemplate: 1 } })).toBe(true);
  });

  it('returns false when meta.postTemplate is falsy', () => {
    expect(isTemplateDraft({ meta: { postTemplate: false } })).toBe(false);
    expect(isTemplateDraft({ meta: {} })).toBe(false);
  });

  it('returns false when meta or draft is missing', () => {
    expect(isTemplateDraft({})).toBe(false);
    expect(isTemplateDraft(null)).toBe(false);
    expect(isTemplateDraft(undefined)).toBe(false);
  });
});

describe('templateDisplayName', () => {
  it('prefers meta.templateName over title', () => {
    expect(
      templateDisplayName({ title: 'Draft title', meta: { templateName: 'Weekly report' } }),
    ).toBe('Weekly report');
  });

  it('falls back to draft title', () => {
    expect(templateDisplayName({ title: 'Draft title', meta: { postTemplate: true } })).toBe(
      'Draft title',
    );
  });

  it('returns empty string when neither is set', () => {
    expect(templateDisplayName({ meta: {} })).toBe('');
    expect(templateDisplayName({})).toBe('');
    expect(templateDisplayName(null)).toBe('');
    expect(templateDisplayName(undefined)).toBe('');
  });
});
