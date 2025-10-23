export interface OrderUpdateEvent {
  type: 'CONNECTED' | 'STATUS_UPDATE' | 'ORDER_DELIVERED' | 'ERROR';
  order?: any;
  message?: string;
  timestamp: string;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private onMessage: (event: OrderUpdateEvent) => void,
    private onError?: (error: Event) => void,
    private onOpen?: (event: Event) => void
  ) {}

  connect(orderId: string): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${orderId}/stream`;
    
    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = (event) => {
        console.log('SSE: Connection opened');
        this.reconnectAttempts = 0;
        this.onOpen?.(event);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: OrderUpdateEvent = JSON.parse(event.data);
          console.log('SSE: Received event:', data.type);
          this.onMessage(data);
        } catch (error) {
          console.error('SSE: Error parsing message:', error);
        }
      };

      this.eventSource.onerror = (event) => {
        console.error('SSE: Connection error:', event);
        
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.handleReconnect(orderId);
        }
        
        this.onError?.(event);
      };

    } catch (error) {
      console.error('SSE: Failed to create EventSource:', error);
      this.handleReconnect(orderId);
    }
  }

  private handleReconnect(orderId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`SSE: Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect(orderId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('SSE: Max reconnection attempts reached');
      this.onMessage({
        type: 'ERROR',
        message: 'Failed to connect to order tracking',
        timestamp: new Date().toISOString()
      });
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('SSE: Connection closed');
    }
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

// Hook for React components
export const useOrderSSE = (orderId: string | null) => {
  const [order, setOrder] = React.useState<any>(null);
  const [status, setStatus] = React.useState<'connecting' | 'connected' | 'error' | 'closed'>('connecting');
  const [lastUpdate, setLastUpdate] = React.useState<string>('');

  React.useEffect(() => {
    if (!orderId) return;

    const sseClient = new SSEClient(
      (event) => {
        setLastUpdate(event.timestamp);
        
        switch (event.type) {
          case 'CONNECTED':
            setStatus('connected');
            if (event.order) setOrder(event.order);
            break;
          
          case 'STATUS_UPDATE':
            if (event.order) setOrder(event.order);
            break;
          
          case 'ORDER_DELIVERED':
            if (event.order) setOrder(event.order);
            setStatus('closed');
            break;
          
          case 'ERROR':
            setStatus('error');
            break;
        }
      },
      (error) => {
        console.error('SSE error:', error);
        setStatus('error');
      },
      () => {
        setStatus('connected');
      }
    );

    sseClient.connect(orderId);

    return () => {
      sseClient.disconnect();
    };
  }, [orderId]);

  return { order, status, lastUpdate };
};