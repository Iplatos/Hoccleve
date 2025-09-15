// import React, {useCallback, useEffect, useRef, useState} from 'react';
// import {GiftedChat, IMessage} from "react-native-gifted-chat";
//
// export const ChatScreenNew = () => {
//     const [messages, setMessages] = useState<IMessage[]>([]);
//     const ws = useRef(null);
//
//
//
//     const onSend = useCallback((messages = []) => {
//         // Отправляем через WebSocket
//         if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//             ws.current.send(messages[0].text);
//         }
//         setMessages((previousMessages) =>
//             GiftedChat.append(previousMessages, messages)
//         );
//     }, []);
//
//     return (
//         <GiftedChat
//             messages={messages}
//             onSend={(messages) => onSend(messages)}
//             user={{
//                 _id: 1,
//             }}
//             placeholder="Введите сообщение..."
//         />
//     );
// }