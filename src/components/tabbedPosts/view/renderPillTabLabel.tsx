import React from 'react';
import { Tag } from '../..';

/**
 * Shared "pill" tab label used by both the home-feed and the waves tab bars:
 * an uppercase Tag that fills with the active colour when the tab is focused.
 * The caller passes an already-resolved display string as `labelText` (the
 * home feed resolves its i18n key first; the waves bar passes the route title
 * directly), so this helper stays intl-free and is the single source of truth
 * for the tab-bar pill look.
 */
export const renderPillTabLabel = ({
  labelText,
  focused,
}: {
  labelText: string;
  focused: boolean;
}) => <Tag key={labelText} value={(labelText || '').toUpperCase()} isFilter isPin={focused} />;

export default renderPillTabLabel;
