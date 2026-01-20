/**
 * SDK Extensions
 *
 * This module provides wrappers and extensions for Ecency SDK functionality
 * that's either not yet in the SDK or needs mobile-specific customization.
 *
 * Organization:
 * - Draft mutations: Re-exported from SDK with mobile wrappers
 * - Schedule mutations: Re-exported from SDK with mobile wrappers
 * - Notification mutations: Custom implementations for Ecency private API
 * - Media mutations: Kept in editorQueries.ts (Ecency-specific image upload)
 */

export {
  // Draft mutations (SDK re-exports)
  useAddDraftMutation,
  useUpdateDraftMutation,
  useDeleteDraftMutation,
  // Schedule mutations (SDK re-exports)
  useAddScheduleMutation,
  useDeleteScheduleMutation,
  useMoveScheduleToDraftsMutation,
  // Notification mutations (custom implementations)
  useMarkNotificationsReadMutation,
} from './private-api-mutations';
