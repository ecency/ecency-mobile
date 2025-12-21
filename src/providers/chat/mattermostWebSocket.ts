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

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[MattermostWS] Connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this._authenticate();
        this._startHeartbeat();
        config.onReconnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: MattermostWebSocketEvent = JSON.parse(event.data);

          // Update sequence number
          if (message.seq && message.seq > this.lastSequence) {
            this.lastSequence = message.seq;
          }

          // Handle authentication response
          if (message.event === ('hello' as any)) {
            console.log('[MattermostWS] Authenticated successfully');
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
        console.error('[MattermostWS] Error:', error);
        this.isConnecting = false;
        config.onError?.(new Error(error.message || 'WebSocket error'));
      };

      this.ws.onclose = () => {
        console.log('[MattermostWS] Disconnected');
        this.isConnecting = false;
        this._stopHeartbeat();

        if (!this.isClosed) {
          config.onClose?.();
          this._scheduleReconnect();
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
      return;
    }

    const authMessage = {
      seq: ++this.lastSequence,
      action: 'authentication_challenge',
      data: {
        token: this.config.token,
      },
    };

    this._send(authMessage);
  }

  private _send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[MattermostWS] Cannot send, not connected');
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
