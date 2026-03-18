class WebSocketService {
  connect(_token?: string | null) {
    return;
  }

  disconnect() {
    return;
  }

  subscribe<T>(_destination: string, _callback: (payload: T) => void) {
    return () => {
      return;
    };
  }
}

export const websocketService = new WebSocketService();
