// useChatSocket.ts
import {useEffect, useRef} from 'react';

export const useChatSocket = (
    onMessage?: (data: any) => void,
    onOpen?: () => void,
    onClose?: () => void,
) => {
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('wss://api.lk-impulse.ru:9090/');


        socket.onopen = () => {
            console.log('WebSocket connected');
            if (onOpen) onOpen();
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('Invalid JSON:', event.data);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
            if (onClose) onClose();
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socketRef.current = socket;

        return () => {
            socket.close();
        };
    }, []);

    const sendMessage = (message: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not open');
        }
    };

    return {
        sendMessage,
    };
};
