import React, {useEffect, useState} from 'react';
import {
    ActivityIndicator,
    Button,
    FlatList,
    Image, KeyboardAvoidingView,
    Modal, Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {
    Chat,
    createChat, deleteChatById,
    fetchChatMessages,
    fetchChatsList,
    fetchChatUserNameList, fixChatById, muteChat, unfixChat, unMuteChat
} from "../redux/slises/chat/chatSlice.ts";
import {ROUTES} from "../constants/Routes.ts";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {Colors} from "../constants/Colors.ts";
import Toast from "react-native-toast-message";
import {toastConfig} from "../settings/ToastHelper.tsx";
import {fetchActiveUsers} from "../redux/slises/chat/activeUsersSlice.ts";
import {IconButton, Menu, Portal} from "react-native-paper";
import {UniversalModal} from "../components/UniversalModal/UniversalModal.tsx";
import {getUrl} from "../settings/utils.ts";
import {CreateChatScreen} from "./CreateChatScreen.tsx";


interface ChatItem {
    id: string;
    name: string;
    lastMessage: string;
    avatar: string;
    type: 'personal' | 'group';
}

interface Notification {
    chat_id: number | null;
    // другие поля, если нужно
}


export const ChatScreen = ({navigation}: any) => {
    const dispatch = useAppDispatch();
    const [filter, setFilter] = useState<'all' | 'personal' | 'group'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const {notifications} = useAppSelector(state => state.chatActiveUsers)
    const [visibleMenus, setVisibleMenus] = useState<Record<number, boolean>>({});
    const [chatId, setChatId] = useState<number | null>(null);
    const [modalTitle, setModalTitle] = useState<string>('');
    const [modalAction, setModalAction] = useState<'delete' | 'fix' | 'unFix' | 'mute' | 'unMute' | null>(null);
    const settings = useAppSelector((state) => state.settings.data);
    const isChildrenCanStartChat = settings?.find(el => el.key === 'isChildrenCanStartChat')?.value === '1'
    const [url, setUtl] = useState<string | null>(null)
    const [isCreateChat, setIsCreateChat] = useState(false)

    useEffect(() => {
        const fetchUrl = async () => {
            const value = await getUrl();
            setUtl(value);
        };
        fetchUrl();
    }, []);

    const openMenu = (chatId: number) => {
        setVisibleMenus(prev => ({...prev, [chatId]: true}));
    };

    const closeMenu = (chatId: number) => {
        setVisibleMenus(prev => ({...prev, [chatId]: false}));
    };
    const {chats, chatUsers} = useAppSelector(state => state.chats)

    const sortedChats = chats
        .filter(chat => {
            if (filter === 'personal') {
                return chat.members?.length === 1;
            }

            if (filter === 'group') {
                return chat.members?.length >= 2;
            }

            return true; // для filter === 'all'
        })
        .sort((a, b) => {
            if (a.isFixed === b.isFixed) return 0;
            return a.isFixed ? -1 : 1;
        });


    const filteredUsers = chatUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        dispatch(fetchChatUserNameList({}))
        dispatch(fetchChatsList());
    }, []);

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(fetchChatUserNameList({}))
            await dispatch(fetchChatsList());
            await dispatch(fetchActiveUsers());
        } catch (e) {
            console.error('Ошибка обновления чатов:', e);
        } finally {
            setRefreshing(false);
        }
    };


    const unreadCountsByChatId: Record<number, number> = (notifications as Notification[]).reduce<Record<number, number>>((acc, curr) => {
        if (curr.chat_id !== null) {
            acc[curr.chat_id] = (acc[curr.chat_id] || 0) + 1;
        }
        return acc;
    }, {});


    const createChatHandler = async (item: Chat) => {
        try {
            // setSearchQuery(user.name);
            setIsSearchFocused(false);
            const resultAction = await dispatch(createChat({...item, role: 0}));

            if (createChat.fulfilled.match(resultAction)) {
                const chatId = resultAction.payload.id;
                await dispatch(fetchChatMessages(+chatId));
                await dispatch(fetchActiveUsers());
                await dispatch(fetchChatsList());
                navigation.navigate(ROUTES.CHAT_DETAIL,{ name: item.name});
            } else {
                console.warn('Ошибка создания чата:', resultAction.payload);
            }
        } catch (error) {
            console.error('Ошибка при создании чата:', error);
        }
    }

    const handleModalAction = async () => {
        if (!chatId || !modalAction) return;

        if (modalAction === 'delete') {
            dispatch(deleteChatById(chatId))
                .unwrap()
                .then(() => {
                    Toast.show({
                        type: 'success',
                        text1: 'Чат успешно удалён',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                })
                .catch((error) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Ошибка!',
                        text2: typeof error === 'string' ? error : '',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                });
        } else if (modalAction === 'fix') {
            dispatch(fixChatById(chatId))
                .unwrap()
                .then(() => {
                    Toast.show({
                        type: 'success',
                        text1: 'Чат успешно закреплен',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                })
                .catch((error) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Ошибка!',
                        text2: typeof error === 'string' ? error : '',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                });
        } else if (modalAction === 'unFix') {
            dispatch(unfixChat())
                .unwrap()
                .then(() => {
                    Toast.show({
                        type: 'success',
                        text1: 'Чат успешно откреплен',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                })
                .catch((error) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Ошибка!',
                        text2: typeof error === 'string' ? error : '',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                });
        } else if (modalAction === 'mute') {
            dispatch(muteChat(chatId))
                .unwrap()
                .then(() => {
                    Toast.show({
                        type: 'success',
                        text1: 'Уведомления выключены!',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                })
                .catch((error) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Ошибка!',
                        text2: typeof error === 'string' ? error : '',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                });

        } else if (modalAction === 'unMute') {
            dispatch(unMuteChat(chatId))
                .unwrap()
                .then(() => {
                    Toast.show({
                        type: 'success',
                        text1: 'Уведомления включены!',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                })
                .catch((error) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Ошибка!',
                        text2: typeof error === 'string' ? error : '',
                        position: 'bottom',
                        bottomOffset: 50,
                    });
                });
        }

        setChatId(null);
    };

    return (
        <>
            {/*<GestureHandlerRootView style={{flex: 1}}>*/}
            {
                isCreateChat
                    ? <CreateChatScreen setIsCreateChat={setIsCreateChat}/>
                    : <>
                        <View style={styles.container}>
                            <View style={styles.filterContainer}>
                                <TouchableOpacity
                                    style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
                                    onPress={() => setFilter('all')}
                                >
                                    <Text
                                        style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>Все</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.filterButton, filter === 'personal' && styles.activeFilter]}
                                    onPress={() => setFilter('personal')}
                                >
                                    <Text
                                        style={[styles.filterText, filter === 'personal' && styles.activeFilterText]}>Личные</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.filterButton, filter === 'group' && styles.activeFilter]}
                                    onPress={() => setFilter('group')}
                                >
                                    <Text
                                        style={[styles.filterText, filter === 'group' && styles.activeFilterText]}>Группы</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 16,
                                justifyContent: 'space-between',
                            }}>
                                {!isChildrenCanStartChat &&
                                    <>
                                        <TextInput
                                            style={styles.searchInput}
                                            placeholderTextColor={Colors.textGray}
                                            placeholder="Введите ФИО собеседника"
                                            value={searchQuery}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onChangeText={setSearchQuery}
                                            onBlur={() => setIsSearchFocused(false)}
                                            onLayout={() => setIsSearchFocused(false)}
                                        />
                                        <IconButton
                                            icon="plus-circle-outline"
                                            size={25}
                                            style={{margin: 0}}
                                            iconColor={Colors.colorGreen}
                                            onPress={() => setIsCreateChat(true)}
                                            // onPress={() => navigation.navigate(ROUTES.CREATE_CHAT)}
                                        />
                                    </>

                                }
                            </View>
                            {isSearchFocused && (
                                <View style={styles.userDropdown}>
                                    <FlatList
                                        data={filteredUsers}
                                        keyExtractor={(item) => item.id.toString()}
                                        keyboardShouldPersistTaps="handled"
                                        renderItem={({item}) => (
                                            <TouchableOpacity
                                                style={styles.userItem}
                                                onPress={() => createChatHandler(item)}
                                            >
                                                <Text style={styles.userName}>{item.name}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            )}


                            <FlatList
                                data={sortedChats}
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({item}) => {
                                    const chatId = item.id;
                                    const isGroupChat = !!item.name;
                                    const member = item.members?.[0];
                                    const name = isGroupChat ? item.name : member?.name || 'Без имени';
                                    //   const name = member?.name || 'Без имени';
                                    const unreadCount = unreadCountsByChatId[chatId] || 0;

                                    let lastMessageText = '';

                                    try {
                                        const message = item?.lastMessage?.message;

                                        if (typeof message === 'string') {
                                            const trimmed = message.trim();

                                            if (trimmed.startsWith('{')) {
                                                // Пробуем распарсить как объект
                                                const parsed = JSON.parse(trimmed);
                                                lastMessageText = parsed.text || '';
                                            } else if (
                                                (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                                                (trimmed.startsWith("'") && trimmed.endsWith("'"))
                                            ) {
                                                // Строка в кавычках — пробуем распарсить как строку
                                                lastMessageText = JSON.parse(trimmed); // снимет кавычки
                                            } else {
                                                // Просто текст
                                                lastMessageText = trimmed;
                                            }
                                        }
                                    } catch {
                                        lastMessageText = item?.lastMessage?.message || '';
                                    }

                                    return (
                                        <TouchableOpacity
                                            onPress={() => {
                                                dispatch(fetchChatMessages(chatId));
                                                dispatch(fetchActiveUsers());
                                                navigation.navigate(ROUTES.CHAT_DETAIL, {name});
                                            }}
                                            style={{
                                                flex: 1
                                            }}
                                        >
                                            <View style={styles.chatItem}>
                                                {item.isFixed && <IconButton
                                                    icon="auto-fix"
                                                    size={20}
                                                    iconColor={Colors.colorGreen}
                                                />}
                                                {item.avatar ? (
                                                    <Image source={{uri: `${url}${item.avatar}`}} style={styles.avatar}/>
                                                ) : (
                                                    <View style={styles.placeholderAvatar}/>
                                                )}

                                                <View style={styles.chatDetails}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            flex: 1
                                                        }}>
                                                            <View>
                                                                <Text style={styles.chatName}>{name}</Text>
                                                                <Text style={styles.lastMessage}>
                                                                    {lastMessageText.length > 40 ? `${lastMessageText.substring(0, 40)}...` : lastMessageText}
                                                                </Text>
                                                            </View>
                                                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                                                {
                                                                    item.muted && <IconButton
                                                                        icon="volume-mute"
                                                                        size={20}
                                                                        iconColor={Colors.colorAccentFirst}
                                                                    />
                                                                }
                                                                {unreadCount > 0 && (
                                                                    <View style={styles.badge}>
                                                                        <Text style={styles.badgeText}>
                                                                            {unreadCount > 99 ? '99+' : unreadCount}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </View>


                                                        </View>

                                                        <Menu
                                                            visible={visibleMenus[chatId]}
                                                            onDismiss={() => closeMenu(chatId)}
                                                            anchor={
                                                                <IconButton
                                                                    icon="dots-vertical"
                                                                    style={{margin: 0, paddingHorizontal: 10}}
                                                                    size={20}
                                                                    onPress={() => openMenu(chatId)}
                                                                />
                                                            }
                                                        >
                                                            <Menu.Item
                                                                onPress={() => {
                                                                    closeMenu(chatId);
                                                                    setModalTitle('Вы хотите удалить данный чат?')
                                                                    setChatId(chatId);
                                                                    setModalAction('delete')
                                                                }}
                                                                title="Удалить чат"/>
                                                            <Menu.Item
                                                                onPress={() => {
                                                                    closeMenu(chatId);
                                                                    setModalTitle(item.isFixed ? 'Вы хотите открепить данный чат?' : 'Вы хотите закрепить данный чат?')
                                                                    setChatId(chatId);
                                                                    setModalAction(item.isFixed ? 'unFix' : 'fix')
                                                                }}
                                                                title={item.isFixed ? 'Открепить чат' : 'Закрепить в списке чатов'}/>
                                                            <Menu.Item
                                                                onPress={() => {
                                                                    closeMenu(chatId);
                                                                    setChatId(chatId);
                                                                    setModalTitle(item.muted ? 'Включить уведомления?' : 'Выключить уведомления?')
                                                                    setModalAction(item.muted ? 'unMute' : 'mute')
                                                                }}
                                                                title={item.muted ? 'Включить уведомления' : 'Выключить уведомления'}/>
                                                        </Menu>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                        <UniversalModal
                            visible={chatId !== null}
                            onClose={() => setChatId(null)}
                            onConfirm={() => handleModalAction()}
                            title={modalTitle}
                            confirmText="Да"
                            cancelText="Отмена"
                        />
                    </>
            }


            {/*</GestureHandlerRootView>*/}
            <Toast config={toastConfig}/>
        </>
    );
};

const styles = StyleSheet.create({
    modalWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        //  flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    modalDeleteButton: {

        marginHorizontal: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: 'red',
    },
    modalButton: {
        marginHorizontal: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: Colors.colorGray
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    userDropdown: {
        position: 'absolute',
        top: 130,
        left: 10,
        right: 10,
        maxHeight: 200,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        zIndex: 80,
    },
    userItem: {
        padding: 12,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    userName: {
        fontSize: 16,
    },
    badge: {
        backgroundColor: 'red',
        borderRadius: 10,
        paddingHorizontal: 6,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    filterButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    activeFilter: {
        backgroundColor: '#6c5ce7',
    },
    filterText: {
        color: '#333',
    },
    activeFilterText: {
        color: '#fff',
    },
    searchInput: {
        width: '80%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,

    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.colorTime,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    placeholderAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ddd',
        marginRight: 12,
    },
    chatDetails: {
        flex: 1,
    },
    chatName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5
    },
    lastMessage: {
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#ff3b30',
    },
});

