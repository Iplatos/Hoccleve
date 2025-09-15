import React, {useMemo, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {useAppDispatch, useAppSelector} from "../../redux/hooks.ts";
import {useNavigation} from "@react-navigation/native";
import {RNCheckbox} from "../RNCheckbox/RNCheckbox.tsx";
import {CustomPicker} from "../CustomPicker/CustomPicker.tsx";
import {userRoleOptions} from "../../screens/CreateChatScreen.tsx";
import {GlobalStyle} from "../../constants/GlobalStyle.ts";
import {IconButton} from "react-native-paper";
import {Colors} from "../../constants/Colors.ts";
import {
    addChatMembers, AddMemberPayload, AddMemberUsersPayload,
    createChat,
    fetchChatMessages,
    fetchChatsList,
    uploadChatAvatar
} from "../../redux/slises/chat/chatSlice.ts";
import {fetchActiveUsers} from "../../redux/slises/chat/activeUsersSlice.ts";
import {ROUTES} from "../../constants/Routes.ts";
import Toast from "react-native-toast-message";
import {toastConfig} from "../../settings/ToastHelper.tsx";

type Props = {
    setIsAddUser: (isAdd: boolean) => void
    chatId: number
}

export const AddUserInChat = ({setIsAddUser, chatId}: Props) => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation()
    const {chatUsers} = useAppSelector(state => state.chats);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userRoles, setUserRoles] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const disabled = selectedUsers.length > 0
    const [loader, setLoader] = useState(false)

    const toggleUser = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
        if (!userRoles[id]) {
            setUserRoles(prev => ({...prev, [id]: 'member'}));
        }
    };

    const handleRoleChange = (userId: string, role: string) => {
        setUserRoles(prev => ({...prev, [userId]: role}));
    };

    const filteredUsers = chatUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({item}: { item: typeof chatUsers[number] }) => {
        const isSelected = selectedUsers.includes(item.id);

        return (
            <TouchableOpacity
                onPress={() => toggleUser(item.id)}
                style={[styles.userRow, isSelected && styles.userRowSelected]}
                activeOpacity={0.8}
            >
                <View>
                    <RNCheckbox
                        checkboxStyle={{width: 20, height: 20, marginRight: 10}}
                        isChecked={isSelected}
                        onPress={() => toggleUser(item.id)}
                        text={''}
                    />
                </View>
                {item.avatar_path ? (
                    <Image source={{uri: item.avatar_path}} style={styles.avatar}/>
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarLetter}>
                            {item.name?.charAt(0).toUpperCase() || '?'}
                        </Text>
                    </View>
                )}
                <Text style={styles.userName}>{item.name}</Text>
                <CustomPicker
                    options={userRoleOptions}
                    selectedValue={userRoles[item.id] || 'member'}
                    onValueChange={(value) => handleRoleChange(item.id, value)}
                    label="Статус"
                />
            </TouchableOpacity>
        );
    };

    const renderHeader = () => {
        return (
            <>
                <View style={{
                    // flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 15
                }}>
                    <Text style={[GlobalStyle.titleGL, {marginBottom: 0}]}>Выберите участника</Text>
                    <IconButton
                        icon="close"
                        iconColor={Colors.textBlack}
                        style={{
                            margin: 0,
                        }}
                        size={30}
                        onPress={() => setIsAddUser(false)}
                    />
                </View>

                <View style={{position: 'relative', marginBottom: 10}}>
                    <TextInput
                        style={[styles.input, {paddingLeft: 35}]}
                        placeholder="Введите ФИО"
                        placeholderTextColor={Colors.textGray}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <IconButton
                        icon="account-search"
                        iconColor={Colors.textBlack}
                        style={{
                            margin: 0,
                            position: 'absolute',
                            top: 3,
                        }}
                        size={20}
                    />
                </View>
            </>
        )
    }

    const headerComponent = useMemo(() => renderHeader(), [searchQuery]);

    const handleCreate = async () => {
        if (disabled) {
            const selectedData: AddMemberUsersPayload[] = selectedUsers.map(id => {
                const user = chatUsers.find(u => u.id === id);
                return {
                    id: +id,
                    name: user?.name || '',
                    avatar: user?.avatar_path || null,
                    role: userRoles[id],
                };
            });

            const payload: AddMemberPayload = {
                chatId: chatId,
                users: selectedData,
            };

            try {
                setLoader(true)
                await dispatch(addChatMembers(payload)).unwrap();
                setIsAddUser(false)
            } catch (error) {
                Alert.alert(error.error)

             //   console.error('Ошибка при создании чата:', error);
            }
            setLoader(false)
        } else {
            console.log('Введите название чата и выберите участников');
        }
    };

    return (
        <>
            <Toast config={toastConfig}/>
            <View>

                <FlatList
                    data={filteredUsers}
                    ListHeaderComponent={headerComponent}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={{textAlign: 'center', marginTop: 20, color: Colors.textGray}}>
                            Пользователи не найдены
                        </Text>
                    }
                />
                <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!disabled}
                    style={styles.button}
                    onPress={handleCreate}
                >
                    {loader &&
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator/>
                        </View>
                    }
                    <Text style={styles.buttonText}>Обновить данные</Text>
                </TouchableOpacity>
            </View>
        </>

    );
};


const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#dddce3',
        fontSize: 16,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    list: {
        paddingBottom: 80,
        zIndex: 1
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        // paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.colorTime,
    },
    userRowSelected: {

        backgroundColor: '#e6f0ff',
    },
    userName: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ddd',
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#bbb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#FFC93E',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        position: 'absolute',
        bottom: 10,
        left: 16,
        right: 16,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});