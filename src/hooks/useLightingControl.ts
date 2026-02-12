import { useEffect, useRef, useState, useCallback } from 'react';

export function useLightingControl() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        ws.current = new WebSocket('ws://localhost:3001');
        
        ws.current.onopen = () => {
          setIsConnected(true);
          console.log('🎭 Lighting control connected');
        };
        
        ws.current.onclose = () => {
          setIsConnected(false);
          console.log('🎭 Lighting control disconnected, reconnecting in 3s...');
          // Reconnexion automatique après 3s
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };
        
        ws.current.onerror = () => {
          // Silently handle errors - companion might not be running
          console.log('🎭 Lighting control not available');
        };
      } catch (e) {
        console.log('🎭 Lighting control connection failed');
      }
    };
    
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws.current?.close();
    };
  }, []);

  const sendSignal = useCallback((type: 'GREEN' | 'RED' | 'FINISH') => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type }));
      console.log(`🎭 Signal ${type} sent successfully`);
    } else {
      console.warn(`🎭 Signal ${type} FAILED - WebSocket not open (state: ${ws.current?.readyState})`);
    }
  }, []);

  return { sendSignal, isConnected };
}
