import Config from 'react-native-config';
import { AppState, AppStateStatus } from 'react-native';

export type MattermostWebSocketEventType =
  | 'posted'
  | 'post_edited'
  | 'post_deleted'
  | 'reaction_added'
  | 'reaction_removed'
  | 'typing'
  | 'channel_viewed'
  | 'user_added'
  | 'user_removed'
  | 'preferences_changed'
  | 'status_change';

export interface MattermostWebSocketEvent {
  event: MattermostWebSocketEventType;
  data: any;
  broadcast: {
    channel_id?: string;
    team_id?: string;
    user_id?: string;
  };
  seq: number;
}

export interface MattermostWebSocketConfig {
  token: string;
  userId: string;
  onMessage: (event: MattermostWebSocketEvent) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onReconnect?: () => void;
}

class MattermostWebSocketClient {
  private ws: WebSocket | null = null;

  private config: MattermostWebSocketConfig | null = null;

  private reconnectAttempts = 0;

  private maxReconnectAttempts = 10;

  private reconnectDelay = 1000;

  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  private lastSequence = 0;

  private appStateSubscription: any = null;

  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  private connectionTimeout: ReturnType<typeof setTimeout> | null = null;

  private isConnecting = false;

  private isClosed = false;

  private receivedMessageIds = new Set<string>();

  connect(config: MattermostWebSocketConfig) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      console.log('[MattermostWS] Already connecting or connected');
      return;
    }

    this.isConnecting = true;
    this.isClosed = false;
    this.config = config;

    try {
      // Construct WebSocket URL from ECENCY_BACKEND_API
      const backendUrl = Config.ECENCY_BACKEND_API || '';
      const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
      const wsHost = backendUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}://${wsHost}/api/mattermost/websocket`;

      console.log('[MattermostWS] Connecting to:', wsUrl);
      console.log('[MattermostWS] User ID:', config.userId);
      console.log('[MattermostWS] Has token:', !!config.token);

      console.log('[MattermostWS] Creating WebSocket connection...');
      this.ws = new WebSocket(wsUrl);

      console.log('[MattermostWS] WebSocket created, readyState:', this.ws.readyState);
      console.log('[MattermostWS] readyState 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED');

      // Set connection timeout (15 seconds for faster feedback)
      this.connectionTimeout = setTimeout(() => {
        if (this.isConnecting && this.ws) {
          console.error('[MattermostWS] Connection timeout after 15s');
          console.error('[MattermostWS] WebSocket readyState at timeout:', this.ws.readyState);

          this.isConnecting = false;
          this.isClosed = true; // Prevent reconnection

          // Clean up the websocket
          const wsToClose = this.ws;
          this.ws = null;
          wsToClose.close(1000, 'Connection timeout');

          config.onError?.(new Error('Timed out connecting to server'));
        }
      }, 15000);

      this.ws.onopen = () => {
        console.log('[MattermostWS] WebSocket connection opened successfully');
        console.log('[MattermostWS] Final readyState:', this.ws?.readyState);
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Clear connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        console.log('[MattermostWS] Sending authentication...');
        this._authenticate();
        this._startHeartbeat();
        config.onReconnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: MattermostWebSocketEvent = JSON.parse(event.data);
          console.log(
            '[MattermostWS] Received message, event:',
            message.event,
            'seq:',
            message.seq,
          );

          // Update sequence number
          if (message.seq && message.seq > this.lastSequence) {
            this.lastSequence = message.seq;
          }

          // Handle authentication response
          if (message.event === ('hello' as any)) {
            console.log('[MattermostWS] ✓ Authenticated successfully with server');
            return;
          }

          // Prevent duplicate message processing
          if (message.event === 'posted' || message.event === 'post_edited') {
            const postData = message.data?.post ? JSON.parse(message.data.post) : null;
            const messageId = `${message.event}-${postData?.id || message.seq}`;

            if (this.receivedMessageIds.has(messageId)) {
              return; // Skip duplicate
            }

            this.receivedMessageIds.add(messageId);

            // Clean up old message IDs (keep last 1000)
            if (this.receivedMessageIds.size > 1000) {
              const iterator = this.receivedMessageIds.values();
              const firstValue = iterator.next().value;
              this.receivedMessageIds.delete(firstValue);
            }
          }

          // Forward message to handler
          config.onMessage(message);
        } catch (error) {
          console.error('[MattermostWS] Message parse error:', error);
        }
      };

      this.ws.onerror = (error: any) => {
        console.error('[MattermostWS] WebSocket error event fired');
        console.error('[MattermostWS] Error details:', JSON.stringify(error, null, 2));
        console.error('[MattermostWS] Error message:', error.message);
        console.error('[MattermostWS] Error type:', error.type);
        console.error('[MattermostWS] WebSocket readyState:', this.ws?.readyState);

        this.isConnecting = false;

        // Clear connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        config.onError?.(new Error(error.message || 'WebSocket error'));
      };

      this.ws.onclose = (event: any) => {
        console.log('[MattermostWS] WebSocket close event fired');
        console.log('[MattermostWS] Close code:', event?.code);
        console.log('[MattermostWS] Close reason:', event?.reason);
        console.log('[MattermostWS] Clean close:', event?.wasClean);
        console.log('[MattermostWS] isClosed flag:', this.isClosed);

        this.isConnecting = false;
        this._stopHeartbeat();

        // Clear connection timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        // Don't reconnect if we got HTTP 426, 404, 403, 401, 1000 (normal/timeout), or 1006 (abnormal closure)
        // These indicate the endpoint doesn't support WebSocket, auth failed, or connection issues
        const doNotReconnectCodes = [426, 404, 403, 401, 1000, 1002, 1003, 1006];
        const shouldNotReconnect = event?.code && doNotReconnectCodes.includes(event.code);

        if (!this.isClosed && !shouldNotReconnect) {
          console.log('[MattermostWS] Will attempt to reconnect');
          config.onClose?.();
          this._scheduleReconnect();
        } else if (shouldNotReconnect) {
          console.log('[MattermostWS] Not reconnecting due to error code:', event?.code);
          this.isClosed = true;
        } else if (this.isClosed) {
          console.log('[MattermostWS] Not reconnecting - manually closed');
        }
      };

      // Handle app state changes (remove old listener first to prevent leaks)
      this._removeAppStateListener();
      this._setupAppStateListener();
    } catch (error) {
      console.error('[MattermostWS] Connection error:', error);
      this.isConnecting = false;
      config.onError?.(error as Error);
    }
  }

  disconnect() {
    console.log('[MattermostWS] Disconnecting');
    this.isClosed = true;
    this._stopHeartbeat();
    this._removeAppStateListener();
    this._cancelReconnect();

    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.config = null;
    this.reconnectAttempts = 0;
    this.receivedMessageIds.clear();
  }

  sendTyping(channelId: string, parentId?: string) {
    if (!this.config?.userId) {
      console.log('[MattermostWS] Cannot send typing - no user ID');
      return;
    }

    if (!this.isConnected()) {
      console.log('[MattermostWS] Cannot send typing - not connected');
      return;
    }

    const message = {
      action: 'user_typing',
      seq: ++this.lastSequence,
      data: {
        channel_id: channelId,
        parent_id: parentId || '',
      },
    };

    console.log('[MattermostWS] Sending typing event:', message);
    this._send(message);
  }

  updateStatus(status: 'online' | 'away' | 'dnd' | 'offline') {
    if (!this.config?.userId) {
      return;
    }

    const message = {
      action: 'user_update_active_status',
      seq: ++this.lastSequence,
      data: {
        user_id: this.config.userId,
        status,
      },
    };

    this._send(message);
  }

  private _authenticate() {
    if (!this.config) {
      console.error('[MattermostWS] Cannot authenticate - no config');
      return;
    }

    const authMessage = {
      seq: ++this.lastSequence,
      action: 'authentication_challenge',
      data: {
        token: this.config.token,
      },
    };

    console.log('[MattermostWS] Sending authentication message');
    console.log('[MattermostWS] Auth token length:', this.config.token.length);
    console.log('[MattermostWS] Auth token prefix:', `${this.config.token.substring(0, 10)}...`);
    console.log('[MattermostWS] Auth message seq:', authMessage.seq);

    this._send(authMessage);
  }

  private _send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[MattermostWS] Sending:', message.action || 'unknown action');
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[MattermostWS] Cannot send, not connected. readyState:', this.ws?.readyState);
    }
  }

  private _startHeartbeat() {
    this._stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      const ping = {
        seq: ++this.lastSequence,
        action: 'ping',
        data: {},
      };

      this._send(ping);
    }, 30000); // Ping every 30 seconds
  }

  private _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private _scheduleReconnect() {
    if (this.isClosed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[MattermostWS] Max reconnect attempts reached or closed');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * 2 ** (this.reconnectAttempts - 1), 30000);

    console.log(`[MattermostWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    // Cancel any existing reconnect timeout
    this._cancelReconnect();

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isClosed && this.config) {
        this.connect(this.config);
      }
      this.reconnectTimeout = null;
    }, delay);
  }

  private _cancelReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private _setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this._handleAppStateChange);
  }

  private _removeAppStateListener() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  private _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground, reconnect if needed
      if (this.config && !this.isClosed && (!this.ws || this.ws.readyState !== WebSocket.OPEN)) {
        console.log('[MattermostWS] App active, reconnecting');
        this.connect(this.config);
      }
    } else if (nextAppState === 'background') {
      // App went to background, disconnect to save battery
      console.log('[MattermostWS] App backgrounded, disconnecting');
      this._stopHeartbeat();
      this.ws?.close();
    }
  };

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const mattermostWebSocket = new MattermostWebSocketClient();
