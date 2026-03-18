import { Client, StompSubscription } from "@stomp/stompjs";
import { ENV } from "@/src/constants/env";
import { authStore } from "@/src/stores/auth.store";

function buildWebSocketUrl() {
  const apiBaseUrl = ENV.API_BASE_URL.replace(/\/+$/, "");

  if (apiBaseUrl.startsWith("https://")) {
    return `${apiBaseUrl.replace(/^https:\/\//, "wss://")}/ws`;
  }

  return `${apiBaseUrl.replace(/^http:\/\//, "ws://")}/ws`;
}

class WebSocketService {
  private client: Client | null = null;
  private isConnecting = false;
  private subscriptionSequence = 0;
  private subscriptions = new Map<
    string,
    {
      destination: string;
      callback: (payload: unknown) => void;
      stompSubscription?: StompSubscription;
    }
  >();

  connect(token?: string | null) {
    const accessToken = token ?? authStore.getToken();

    if (!accessToken || this.isConnecting || this.client?.connected) {
      return;
    }

    this.isConnecting = true;

    this.client = new Client({
      brokerURL: buildWebSocketUrl(),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      debug: (message) => {
        console.log("[WebSocket]", message);
      },
      onConnect: () => {
        this.isConnecting = false;
        this.resubscribeAll();
        console.log("[WebSocket] Connected");
      },
      onDisconnect: () => {
        this.isConnecting = false;
        console.log("[WebSocket] Disconnected");
      },
      onStompError: (frame) => {
        this.isConnecting = false;
        console.log("[WebSocket] STOMP Error:", frame.headers["message"] ?? "Unknown error");
      },
      onWebSocketClose: () => {
        this.isConnecting = false;
        this.resetRuntimeSubscriptions();
      },
      webSocketFactory: () => new WebSocket(buildWebSocketUrl()),
    });

    this.client.activate();
  }

  disconnect() {
    this.isConnecting = false;

    if (!this.client) {
      return;
    }

    this.resetRuntimeSubscriptions();
    void this.client.deactivate();
    this.client = null;
  }

  subscribe<T>(destination: string, callback: (payload: T) => void) {
    const subscriptionId = `subscription-${++this.subscriptionSequence}`;

    this.subscriptions.set(subscriptionId, {
      destination,
      callback: callback as (payload: unknown) => void,
    });

    this.activateSubscription(subscriptionId);

    return () => {
      const subscription = this.subscriptions.get(subscriptionId);
      subscription?.stompSubscription?.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    };
  }

  private activateSubscription(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription || !this.client?.connected || subscription.stompSubscription) {
      return;
    }

    subscription.stompSubscription = this.client.subscribe(subscription.destination, (message) => {
      try {
        subscription.callback(JSON.parse(message.body) as unknown);
      } catch {
        subscription.callback(message.body);
      }
    });
  }

  private resubscribeAll() {
    for (const subscriptionId of this.subscriptions.keys()) {
      this.activateSubscription(subscriptionId);
    }
  }

  private resetRuntimeSubscriptions() {
    for (const subscription of this.subscriptions.values()) {
      subscription.stompSubscription = undefined;
    }
  }
}

export const websocketService = new WebSocketService();
