import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// Non-reactive store access — does NOT subscribe the component to updates.
// Use for one-off reads (e.g. restoring persisted state) where re-rendering
// on every change would be wasteful or harmful.
export const useAppStore = () => useStore<RootState>();

export * from './useAuth';
export * from './usePostLogin';
export * from './useLinkProcessor';
export * from './useStateWithRef';
export * from './useMattermostWebSocket';
export * from './useTypingThrottle';
export * from './useActiveKeyOperation';
export * from './useCommunitySubscriptionAction';
export * from './useFollowUserAction';
export * from './useTransferMutations';
export * from './useBadActors';
export * from './useUncontrolledInput';
