import { useEffect, useCallback, useRef, useState } from 'react';
import {
  mattermostWebSocket,
  MattermostWebSocketEvent,
} from '../providers/chat/mattermostWebSocket';

export interface UseMattermostWebSocketOptions {
  enabled?: boolean;
  token: string | null;
  userId: string | null;
  channelId?: string;
  onNewMessage?: (post: any) => void;
  onMessageEdited?: (post: any) => void;
  onMessageDeleted?: (postId: string) => void;
  onReactionAdded?: (reaction: any) => void;
  onReactionRemoved?: (reaction: any) => void;
  onUserTyping?: (userId: string, channelId: string) => void;
  onError?: (error: Error) => void;
}

export const useMattermostWebSocket = (options: UseMattermostWebSocketOptions) => {
  const {
    enabled = true,
    token,
    userId,
    channelId,
    onNewMessage,
    onMessageEdited,
    onMessageDeleted,
    onReactionAdded,
    onReactionRemoved,
    onUserTyping,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const channelIdRef = useRef(channelId);
  const userIdRef = useRef(userId);

  // Update refs when values change
  useEffect(() => {
    channelIdRef.current = channelId;
    userIdRef.current = userId;
  }, [channelId, userId]);

  const handleMessage = useCallback(
    (event: MattermostWebSocketEvent) => {
      // Only process events for current channel if channelId is specified
      if (channelIdRef.current && event.broadcast?.channel_id !== channelIdRef.current) {
        return;
      }

      switch (event.event) {
        case 'posted': {
          try {
            const post = JSON.parse(event.data.post);
            onNewMessage?.(post);
          } catch (error) {
            console.error('[useMattermostWS] Failed to parse posted message:', error);
          }
          break;
        }

        case 'post_edited': {
          try {
            const post = JSON.parse(event.data.post);
            onMessageEdited?.(post);
          } catch (error) {
            console.error('[useMattermostWS] Failed to parse edited message:', error);
          }
          break;
        }

        case 'post_deleted': {
          const postId = event.data.post_id;
          if (postId) {
            onMessageDeleted?.(postId);
          }
          break;
        }

        case 'reaction_added': {
          try {
            const reaction = JSON.parse(event.data.reaction);
            onReactionAdded?.(reaction);
          } catch (error) {
            console.error('[useMattermostWS] Failed to parse reaction:', error);
          }
          break;
        }

        case 'reaction_removed': {
          try {
            const reaction = JSON.parse(event.data.reaction);
            onReactionRemoved?.(reaction);
          } catch (error) {
            console.error('[useMattermostWS] Failed to parse reaction:', error);
          }
          break;
        }

        case 'typing': {
          const typingUserId = event.data.user_id;
          console.log('[useMattermostWS] Typing event received:', event.data);

          if (typingUserId && typingUserId !== userIdRef.current) {
            console.log('[useMattermostWS] User is typing:', typingUserId);
            onUserTyping?.(typingUserId, event.broadcast.channel_id || '');

            // Update typing users state
            setTypingUsers((prev) => ({
              ...prev,
              [typingUserId]: Date.now(),
            }));

            // Clear existing timeout
            if (typingTimeoutsRef.current[typingUserId]) {
              clearTimeout(typingTimeoutsRef.current[typingUserId]);
            }

            // Set timeout to remove user from typing after 5 seconds
            typingTimeoutsRef.current[typingUserId] = setTimeout(() => {
              console.log('[useMattermostWS] Clearing typing for user:', typingUserId);
              setTypingUsers((prev) => {
                const updated = { ...prev };
                delete updated[typingUserId];
                return updated;
              });
              delete typingTimeoutsRef.current[typingUserId];
            }, 5000);
          }
          break;
        }

        default:
          break;
      }
    },
    [
      onNewMessage,
      onMessageEdited,
      onMessageDeleted,
      onReactionAdded,
      onReactionRemoved,
      onUserTyping,
    ],
  );

  const handleReconnect = useCallback(() => {
    console.log('[useMattermostWS] WebSocket reconnected');
    setIsConnected(true);
  }, []);

  const handleClose = useCallback(() => {
    console.log('[useMattermostWS] WebSocket closed');
    setIsConnected(false);
  }, []);

  const handleError = useCallback(
    (error: Error) => {
      setIsConnected(false);
      onError?.(error);
    },
    [onError],
  );

  // Connect WebSocket
  useEffect(() => {
    if (!enabled || !token || !userId) {
      console.log(
        '[useMattermostWS] Not connecting - enabled:',
        enabled,
        'token:',
        !!token,
        'userId:',
        !!userId,
      );
      return;
    }

    console.log('[useMattermostWS] Connecting WebSocket...');
    mattermostWebSocket.connect({
      token,
      userId,
      onMessage: handleMessage,
      onError: handleError,
      onClose: handleClose,
      onReconnect: handleReconnect,
    });

    setIsConnected(mattermostWebSocket.isConnected());

    return () => {
      console.log('[useMattermostWS] Disconnecting WebSocket...');
      mattermostWebSocket.disconnect();
      // Clear all typing timeouts
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [enabled, token, userId, handleMessage, handleError, handleClose, handleReconnect]);

  const sendTyping = useCallback(
    (parentId?: string) => {
      if (channelId) {
        console.log('[useMattermostWS] Sending typing event to channel:', channelId);
        mattermostWebSocket.sendTyping(channelId, parentId);
      } else {
        console.log('[useMattermostWS] Cannot send typing - no channelId');
      }
    },
    [channelId],
  );

  const updateStatus = useCallback((status: 'online' | 'away' | 'dnd' | 'offline') => {
    mattermostWebSocket.updateStatus(status);
  }, []);

  return {
    isConnected,
    typingUsers,
    sendTyping,
    updateStatus,
  };
};
