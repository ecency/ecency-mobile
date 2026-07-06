// Post templates are ordinary private-api drafts flagged with meta.postTemplate (created on
// Ecency web); meta.templateName carries the template label.

export const isTemplateDraft = (draft: any): boolean => !!draft?.meta?.postTemplate;

export const templateDisplayName = (draft: any): string =>
  draft?.meta?.templateName || draft?.title || '';
