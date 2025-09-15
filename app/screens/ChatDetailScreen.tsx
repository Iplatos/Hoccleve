import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import {Bubble, GiftedChat, IMessage, Message, Send} from "react-native-gifted-chat";
import React, {useEffect, useRef, useState} from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {
    createMessage,
    fetchChatsList,
    fetchChatUserNameList,
    fixMessage,
    removeMessage,
    unfixMessage
} from "../redux/slises/chat/chatSlice.ts";
import {formatCommentDate, getUrl} from "../settings/utils.ts";
import Toast from "react-native-toast-message";
import {fetchActiveUsers} from "../redux/slises/chat/activeUsersSlice.ts";
import {Colors} from "../constants/Colors.ts";
import {IconButton} from "react-native-paper";

import 'dayjs/locale/ru'
import {useNavigation, useRoute} from "@react-navigation/native";
import {useActionSheet} from "@expo/react-native-action-sheet";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {ChatInfo} from "../components/ChatInfo/ChatInfo.tsx";

interface IFile {
    path: string;
    original: string;
    type: string;
}

interface IMessageWithFile extends IMessage {
    file?: IFile;
}

export const ChatDetailScreen = () => {
    const route = useRoute();
    const {showActionSheetWithOptions} = useActionSheet();
    const {name} = route.params as { name: string };
    const dispatch = useAppDispatch();
    const navigation = useNavigation()

    const {bottom, top} = useSafeAreaInsets();


    const {selectedChat, status, chatMessagesStatus} = useAppSelector(state => state?.chats);
    const rawMessages = useAppSelector(state => state?.chats?.selectedChat?.messages);
    const chatMembers = useAppSelector(state => state?.chats?.selectedChat?.members);
    const user = useAppSelector(state => state.user.user);

    const socketRef = useRef<WebSocket | null>(null);
    const chatMembersRef = useRef(chatMembers);

    const isLoading = chatMessagesStatus === "loading";


    const [messages, setMessages] = useState<IMessage[]>([]);
    const [fixedMessagePrev, setFixedMessagePrev] = useState<IMessage | null>(null);
    const [isOpenInfoChat, setIsOpenInfoChat] = useState<boolean>(false);

    const CURRENT_USER_ID = user?.id;
    const CHAT_ID = selectedChat?.id;

    const fixedMessage = rawMessages?.filter((message) => message.id === selectedChat?.fixedMessage.id);


    useEffect(() => {
        chatMembersRef.current = chatMembers;
    }, [chatMembers]);

    const [url, setUtl] = useState<string | null>(null)
    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUtl(value);
        };
        fetchUrl();
    }, []);
    useEffect(() => {
        if (Array.isArray(fixedMessage) && fixedMessage.length > 0) {
            const fixedMes = fixedMessage.map((msg) => {
                const hasFiles = Array.isArray(msg.files) && msg.files.length > 0;

                const baseMessage: IMessageWithFile = {
                    _id: msg.id,
                    text: msg.message?.replace(/^"|"$/g, '') || '',
                    createdAt: formatCommentDate(msg.createdAt),
                    user: {
                        _id: msg.user_id,
                        name: chatMembers?.find(m => m.user_id === msg.user_id)?.name || `User ${msg.user_id}`,
                    },
                };

                if (hasFiles) {
                    const file = msg.files[0];
                    baseMessage.file = {
                        path: file.path,
                        original: file.original,
                        type: file.type,
                    };
                }

                return baseMessage;
            });


            setFixedMessagePrev(fixedMes[0]);
        } else {
            console.warn('fixedMessage is not an array or empty:', fixedMessage);
            setFixedMessagePrev(null); // или null, по ситуации
        }

        // if (rawMessages && rawMessages.length > 0) {
        const formatted = rawMessages?.map((msg) => {
            const hasFiles = Array.isArray(msg.files) && msg.files.length > 0;

            const baseMessage: IMessageWithFile = {
                _id: msg.id,
                text: msg.message?.replace(/^"|"$/g, '') || '', // убираем кавычки
                createdAt: new Date(msg.createdAt),
                user: {
                    _id: msg.user_id,
                    name: chatMembers?.find(m => m.user_id === msg.user_id)?.name || `User ${msg.user_id}`,
                },
            };

            if (hasFiles) {
                const file = msg.files[0]; // если несколько — бери нужный
                baseMessage.file = {
                    path: file.path,
                    original: file.original,
                    type: file.type,
                };
            }

            return baseMessage;
        });

        // GiftedChat ожидает сообщения в убывающем порядке
        setMessages(formatted?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        // }
    }, [rawMessages, chatMembers]);
    useEffect(() => {
        const socket = new WebSocket('wss://api.lk-impulse.ru:9090/');

        socketRef.current = socket;

        socket.onopen = () => {
            console.log('✅ WebSocket открыт');

            const registerMessage = {
                type: 'register',
                userId: CURRENT_USER_ID,
            };
            console.log('📤 Отправка register:', registerMessage);
            socket.send(JSON.stringify(registerMessage));

            const joinChatMessage = {
                type: 'join_chat',
                chatId: selectedChat?.id,
            };
            console.log('📤 Отправка join_chat:', joinChatMessage);
            socket.send(JSON.stringify(joinChatMessage));
        };


        socket.onmessage = (event) => {
            //    console.log('📥 Получено сообщение:', event.data);
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'chat_message') {
                    const msg = data.message;

                    const incomingMessage: IMessage = {
                        _id: msg.id,
                        text: msg.message,
                        createdAt: new Date(msg.createdAt),
                        user: {
                            _id: msg.user_id,
                            name: chatMembersRef.current?.find(m => m.user_id === msg.user_id)?.name || `User ${msg.user_id}`,
                        },
                    };

                    setMessages((prev) => {
                        const alreadyExists = prev.some(m => m._id === incomingMessage._id);
                        if (alreadyExists) return prev;

                        return GiftedChat.append(prev, [incomingMessage]);
                    });
                }

                if (data.type === 'file_uploaded') {
                    const file = data.file;

                    const incomingFileMessage: IMessageWithFile = {
                        _id: file.id,
                        text: `📎 Файл: ${file.original}`,
                        createdAt: new Date(file.created_at),
                        user: {
                            _id: file.user_id,
                            name: chatMembers?.find(m => m.user_id === file.user_id)?.name || `User ${file.user_id}`,
                        },
                        file: {
                            path: file.path,
                            original: file.original,
                            type: file.type,
                        },
                    };

                    setMessages((prev) => GiftedChat.append(prev, [incomingFileMessage]));
                }

            } catch (err) {
                console.error('❌ Ошибка при обработке сообщения', err);
            }
        };

        socket.onerror = (error) => {
            console.error('❌ WebSocket ошибка', error);
        };

        return () => {
            // При выходе из чата
            if (socket && socket.readyState === WebSocket.OPEN) {
                const leaveMessage = {
                    type: 'leave_chat',
                    chatId: selectedChat?.id,
                };
                console.log('📤 Отправка leave_chat:', leaveMessage);
                socket.send(JSON.stringify(leaveMessage));
                dispatch(fetchActiveUsers());
                dispatch(fetchChatsList());
                dispatch(fetchChatUserNameList({}))
            }

            //  socket.close();
            //  console.warn('🔌 WebSocket закрыт при выходе из чата');
        };
    }, [CHAT_ID]);
    const onSend = (newMessages = []) => {

        const socket = socketRef.current;
        const msg = newMessages[0];
        dispatch(createMessage({message: msg.text, chatId: CHAT_ID!}))

        console.log('📝 Новое сообщение:', msg);

        setMessages((prev) => GiftedChat.append(prev, newMessages));

        if (socket && socket.readyState === WebSocket.OPEN) {
            const outgoingMessage = {
                type: 'chat_message',
                chatId: CHAT_ID,
                message: msg.text,
            };

            console.log('📤 Отправка через WebSocket:', outgoingMessage);
            socket.send(JSON.stringify(outgoingMessage));
        } else {
            console.warn('⚠️ WebSocket не готов, сообщение не отправлено');
        }
    };
    const renderMessage = (props: any) => {
        const {currentMessage} = props;
        // console.log('currentMessage', currentMessage)

        const SenderName = () => (
            <Text style={{
                fontSize: 12,
                color: '#555',
                marginBottom: 2,
                marginLeft: 5,
            }}>
                {currentMessage?.user?.name}
            </Text>
        );

        if (currentMessage.file) {
            const {path, original, type} = currentMessage.file;
            const fullUrl = `${url}${path}`;
            const isImage = type.startsWith('image/');

            return (
                <View style={{padding: 5}}>
                    {
                        props.user._id !== props.currentMessage.user._id && <SenderName/>
                    }

                    <View style={{
                        padding: 10,
                        borderRadius: 8,
                        margin: 5,
                        //  backgroundColor: '#e8f0ff',
                        alignItems: 'flex-start',
                    }}>
                        {isImage ? (
                            <TouchableOpacity onPress={() => Linking.openURL(fullUrl)}>
                                <Image
                                    source={{uri: fullUrl}}
                                    style={{width: 200, height: 150, borderRadius: 5}}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        ) : (
                            <Text style={{fontSize: 16}}>📎 {original}</Text>
                        )}
                    </View>
                </View>
            );
        }


        // Обычное текстовое сообщение
        return (
            <TouchableOpacity activeOpacity={0.9}>
                <Message {...props} />
            </TouchableOpacity>

        );
    };
    const renderSend = (props: IMessage) => {
        return (
            <Send {...props}>
                <View>
                    <IconButton
                        icon="send-circle"
                        size={30}
                        style={{margin: 0}}
                        iconColor={Colors.colorAccentSecond}
                    />
                </View>
            </Send>
        )
    }
    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#0084ff',
                    },
                    left: {
                        backgroundColor: Colors.white,
                    },
                }}
                textStyle={{
                    right: {
                        color: '#fff',
                    },
                    left: {
                        color: '#000',
                    },
                }}
            />
        );
    };

    const handleUnfixMessage = async () => {
        if (!fixedMessagePrev?._id || !CHAT_ID) return;

        try {
            await dispatch(unfixMessage({
                chatId: CHAT_ID,
            })).unwrap();
            console.log('✅ Сообщение откреплено');
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Ошибка",
                text2: error?.error,
                position: 'top',
                topOffset: 50,
            });
            console.warn('❌ Ошибка при откреплении сообщения:', error);
        }
    };

    const renderFixedMessage = () => {
        return (
            <TouchableOpacity
                onLongPress={() => {
                    const options = ['Открепить сообщение', 'Отмена'];
                    const destructiveButtonIndex = 0;
                    const cancelButtonIndex = 1;

                    showActionSheetWithOptions({
                        options,
                        containerStyle: {
                            paddingBottom: bottom
                        },
                        cancelButtonIndex,
                        destructiveButtonIndex
                    }, (selectedIndex: any) => {
                        switch (selectedIndex) {
                            case 0:
                                handleUnfixMessage();
                                break;
                            case cancelButtonIndex:
                            // Canceled
                        }
                    });
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 15,
                    backgroundColor: Colors.colorBlueGray,
                    paddingVertical: 10,
                    paddingHorizontal: 15
                }}>
                    <IconButton
                        icon="auto-fix"
                        size={20}
                        style={{margin: 0}}
                        iconColor={Colors.colorGreen}
                    />
                    <View style={{flex: 1}}>
                        <View style={{flexDirection: 'row', gap: 15, alignItems: 'center', marginBottom: 10}}>
                            <Text style={{
                                fontSize: 18,
                                color: Colors.colorBlack
                            }}>{fixedMessagePrev?.user.name}</Text>
                            <Text>{fixedMessagePrev?.createdAt}</Text>
                        </View>
                        <Text style={{flexShrink: 1, flexWrap: 'wrap'}}>
                            {fixedMessagePrev?.text}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

        )
    }
    console.log(top)
    return (
        <>
            {
                isOpenInfoChat
                    ? <ChatInfo
                    chatId={CHAT_ID!}
                    userId={CURRENT_USER_ID!}
                    currentUserId={CURRENT_USER_ID!}
                    setIsOpenInfoChat={setIsOpenInfoChat}
                    isOpenInfoChat={isOpenInfoChat}/>
                    : <>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            style={{flex: 1, paddingBottom: bottom,}}
                            // behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                          //  keyboardVerticalOffset={Platform.OS === 'ios' ? top : 0}
                        >
                            <View
                                style={{
                                    marginTop: top,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingVertical: 12,
                                    backgroundColor: '#efeeee',
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#ddd',
                                    paddingHorizontal: 15,
                                    paddingBottom: 10,
                                    gap: 10,
                                    shadowColor: Colors.colorBlack,
                                    shadowOffset: {width: 0, height: 4},
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                            >
                                <IconButton
                                    icon="arrow-left"
                                    size={30}
                                    style={{margin: 0, marginRight: 12}}
                                    iconColor={Colors.colorBlack}
                                    onPress={() => navigation.goBack()}
                                />
                                <Text style={{fontSize: 18, fontWeight: 'bold'}}>{name}</Text>
                                <IconButton
                                    icon="information-outline"
                                    size={30}
                                    style={{margin: 0, marginRight: 12}}
                                    iconColor={Colors.colorBlack}
                                    onPress={setIsOpenInfoChat}
                                />
                            </View>

                            {fixedMessagePrev && renderFixedMessage()}

                            <GiftedChat
                                locale="ru"
                                placeholder="Сообщение"
                                messages={messages}
                                dateFormat="D MMMM"
                                timeFormat="HH:mm"
                                alwaysShowSend
                                onSend={(msgs) => onSend(msgs)}
                                user={{_id: CURRENT_USER_ID!}}
                                renderMessage={renderMessage}
                                renderSend={renderSend}
                                renderBubble={renderBubble}
                                onLongPress={(context, message) => {
                                    const options = ['Закрепить сообщение', 'Удалить сообщение', 'Отмена'];
                                    const destructiveButtonIndex = 0;
                                    const cancelButtonIndex = 2;

                                    showActionSheetWithOptions({
                                        options,
                                        containerStyle: {
                                            paddingBottom: bottom
                                        },
                                        cancelButtonIndex,
                                        destructiveButtonIndex
                                    }, (selectedIndex: any) => {
                                        switch (selectedIndex) {
                                            case 0:
                                                dispatch(fixMessage({messageId: +message._id, chatId: CHAT_ID!}))
                                                console.log('📌 Закрепить сообщение', message);
                                                break;

                                            case 1:
                                                dispatch(removeMessage({messageId: +message._id, chatId: CHAT_ID!}))
                                                console.log('🗑 Удалить сообщение', message);
                                                break;

                                            case cancelButtonIndex:
                                            // Canceled
                                        }
                                    });
                                }}
                            />
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </>
            }


        </>


    );
};