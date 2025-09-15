import React, {useState} from 'react';
import {ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {IconButton} from "react-native-paper";
import {Colors} from "../../constants/Colors.ts";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {CustomPicker} from "../CustomPicker/CustomPicker.tsx";
import {userRoleOptions} from "../../screens/CreateChatScreen.tsx";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {fetchChatMessages, removeChatMember, updateChatMemberRole} from "../../redux/slises/chat/chatSlice.ts";
import {AddUserInChat} from "../AddUserInChat/AddUserInChat.tsx";
import {UniversalModal} from "../UniversalModal/UniversalModal.tsx";
import {useNavigation} from "@react-navigation/native";
import {ROUTES} from "../../constants/Routes.ts";

type Props = {
    isOpenInfoChat: boolean;
    setIsOpenInfoChat: (isOpen: boolean) => void;
    currentUserId: number;
    chatId: number;
    userId: number
}

export const ChatInfo = ({setIsOpenInfoChat, isOpenInfoChat, currentUserId, chatId, userId}: Props) => {
    const navigation = useNavigation()
    const {top, bottom} = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'all' | 'admin'>('all');
    const [userRoles, setUserRoles] = useState<Record<string, string>>({});
    const [isAddUser, setIsAddUser] = useState(false);
    const chatMembers = useAppSelector(state => state?.chats?.selectedChat?.members || []);
    const [showModal, setShowModal] = useState(false);
    const [deleteUser, setDeleteUser] = useState<number | null>(null);
    const [modalTitle, setModalTitle] = useState<string>('');
    const userMember = chatMembers.find((user) => user.user_id === userId);
    console.log(chatMembers)

    const filteredMembers = selectedTab === 'admin'
        ? chatMembers.filter(member => member.role === 1)
        : chatMembers;

    const handleLeaveChat = () => {
        setModalTitle("Вы точно хотите покинуть чат?")
        setShowModal(true)
        setDeleteUser(userMember?.member_id)
        console.log('Покинуть чат');
    };


    const handleRoleChange = (userId: number, role: string) => {
        if (userId === currentUserId) return; // запрет на смену своей роли

        setUserRoles(prev => ({...prev, [userId]: role}));

        const numericRole = role === 'admin' ? 1 : 0;
        const member = chatMembers.find(m => m.user_id === userId);
        if (!member) return;

        // dispatch(updateChatMemberRole({ memberId: member.member_id, role: numericRole }));
        dispatch(updateChatMemberRole({role: numericRole, memberId: member.member_id, chatId: chatId}));
    };

    const deleteUserHandler = async () => {

        if (!deleteUser) return
        setLoading(true)
        try {
            if (modalTitle?.includes('удалить')) {
                await dispatch(removeChatMember({memberId: deleteUser})).unwrap()
                await dispatch(fetchChatMessages(chatId))
                setShowModal(false)
                setDeleteUser(null)
            } else if (modalTitle?.includes('покинуть')) {
                await dispatch(removeChatMember({memberId: deleteUser})).unwrap()
                await dispatch(fetchChatMessages(chatId))
                navigation.navigate(ROUTES.CHAT)
            }

        } catch (error) {

        }
        setLoading(false)
    }


    const renderParticipant = ({item}: { item: any }) => {
        const currentRole = userRoles[item.user_id]
            ? userRoles[item.user_id]
            : item.role === 1 ? 'admin' : 'user';

        return (
            <View style={[styles.userItem]}>
                <View>
                    {item.avatar_path ? (
                        <Image source={{uri: item.avatar_path}} style={styles.avatar}/>
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarLetter}>
                                {item.name?.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.userName}>{item.name}</Text>

                <CustomPicker
                    options={[
                        {label: 'Участник', value: 'user'},
                        {label: 'Администратор', value: 'admin'},
                    ]}
                    selectedValue={currentRole}
                    onValueChange={(value) => handleRoleChange(item.user_id, value)}
                    disabled={item.user_id === currentUserId}
                />


                <IconButton
                    icon="trash-can-outline"
                    size={20}
                    iconColor={Colors.colorBlack}
                    onPress={() => {
                        setModalTitle("Вы действительно хотите удалить участника?")
                        setShowModal(true)
                        setDeleteUser(item.member_id)
                    }}
                />

                {loading && item.member_id === deleteUser &&
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator/>
                    </View>
                }
            </View>
        );
    };

    return (
        <View style={[styles.container, {paddingTop: top, paddingBottom: bottom}]}>
            {
                isAddUser ? <AddUserInChat
                        chatId={chatId}
                        setIsAddUser={setIsAddUser}/> :
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <IconButton
                                icon="arrow-left"
                                size={30}
                                style={{margin: 0}}
                                iconColor={Colors.colorBlack}
                                onPress={() => setIsOpenInfoChat(false)}
                            />
                            <Text style={[GlobalStyle.titleGL, {marginBottom: 0}]}>Информация</Text>
                            <IconButton
                                icon="close"
                                iconColor={Colors.textBlack}
                                size={30}
                                style={{margin: 0}}
                                onPress={() => setIsOpenInfoChat(false)}
                            />
                        </View>

                        {/* Tabs */}
                        <View style={styles.tabs}>
                            <TouchableOpacity onPress={() => setSelectedTab('all')}>
                                <Text style={selectedTab === 'all' ? styles.activeTab : styles.tab}>Все участники</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setSelectedTab('admin')}>
                                <Text
                                    style={selectedTab === 'admin' ? styles.activeTab : styles.tab}>Администраторы</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Add participants */}
                        <TouchableOpacity
                            onPress={() => setIsAddUser(true)}
                            style={styles.addUser}>
                            <IconButton
                                icon="plus-circle-outline"
                                iconColor={Colors.textBlack}
                                size={30}
                                style={{margin: 0}}
                                //   onPress={() => setIsAddUser(true)}
                            />
                            <Text style={styles.addText}>Добавить участников</Text>
                        </TouchableOpacity>

                        {/* User list */}
                        <FlatList
                            data={filteredMembers}
                            keyExtractor={(item) => item.member_id.toString()}
                            renderItem={renderParticipant}
                            //  contentContainerStyle={{paddingBottom: 20}}
                        />

                        {/* Leave chat */}
                        <TouchableOpacity onPress={handleLeaveChat} style={styles.leaveBtn}>
                            <Text style={styles.leaveText}>Покинуть чат</Text>
                        </TouchableOpacity>
                    </>
            }

            <UniversalModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={() => deleteUserHandler()}
                title={modalTitle}
                confirmText="Да"
                cancelText="Отмена"
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#efeeee',
        paddingHorizontal: 16,
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ddd',
    },
    avatarLetter: {
        color: '#000',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    tab: {
        fontSize: 16,
        color: '#888',
        marginRight: 20,
        fontWeight: '500',
    },
    activeTab: {
        fontSize: 16,
        color: Colors.colorBlack,
        fontWeight: '600',
        marginRight: 20,
        borderBottomWidth: 2,
        borderBottomColor: Colors.colorBlack,
        paddingBottom: 4,
    },
    addUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    addText: {
        fontSize: 16,
        color: Colors.colorBlack,
    },
    userItem: {
        zIndex: 50,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.colorTime,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.colorGray,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        flex: 1,
        fontSize: 16,
        color: Colors.colorBlack,
    },
    dropdown: {
        width: 130,
        marginRight: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        paddingHorizontal: 8,
    },
    leaveBtn: {
        alignItems: 'center',
        marginTop: 'auto',
        paddingVertical: 16,
    },
    leaveText: {
        color: 'red',
        fontSize: 16,
    },
});