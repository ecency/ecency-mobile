import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store/store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

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
