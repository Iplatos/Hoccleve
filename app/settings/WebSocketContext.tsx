// websocket/WebSocketProvider.tsx
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {fetchChatsList} from "../redux/slises/chat/chatSlice.ts";


interface IWebSocketContext {
    socketRef: React.MutableRefObject<WebSocket | null>;
    sendMessage: (data: any) => void;
}

const WebSocketContext = createContext<IWebSocketContext | null>(null);

export const useSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const userId = useAppSelector(state => state.user.user?.id);
    const socketRef = useRef<WebSocket | null>(null);
    const [socketState, setSocketState] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (!userId) return;

        const socket = new WebSocket('wss://api.lk-impulse.ru:9090/');
        socketRef.current = socket;
        setSocketState(socket);

        socket.onopen = () => {
            console.log('✅ WebSocket открыт');

            const registerMessage = {
                type: 'register',
                userId: userId,
            };
            console.log('📤 Отправка register:', registerMessage);
            socket.send(JSON.stringify(registerMessage));

        };

        //
        // socket.onmessage = (event) => {
        //     console.log('📥 Получено сообщение:', event.data);
        // };

        socket.onerror = (err) => {
            console.error('❌ WebSocket ошибка', err);
        };

        // return () => {
        //     socket.close();
        // };
    }, [userId]);

    const sendMessage = (data: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(data));
        } else {
            console.warn('⚠️ WebSocket не готов к отправке');
        }
    };

    return (
        <WebSocketContext.Provider value={{socketRef, sendMessage}}>
            {children}
        </WebSocketContext.Provider>
    );
};


