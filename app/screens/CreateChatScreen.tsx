import React, {useCallback, useMemo, useState} from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image, ActivityIndicator
} from 'react-native';
import {useAppDispatch, useAppSelector} from "../redux/hooks.ts";
import {CustomPicker} from "../components/CustomPicker/CustomPicker.tsx";
import {Colors} from "../constants/Colors.ts";
import {RNCheckbox} from "../components/RNCheckbox/RNCheckbox.tsx";
import {IconButton} from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import {createChat, fetchChatMessages, fetchChatsList, uploadChatAvatar} from "../redux/slises/chat/chatSlice.ts";
import {fetchActiveUsers} from "../redux/slises/chat/activeUsersSlice.ts";
import {ROUTES} from "../constants/Routes.ts";
import {useFocusEffect, useNavigation} from "@react-navigation/native";
import {GlobalStyle} from "../constants/GlobalStyle.ts";

export const userRoleOptions = [
    {label: 'Участник', value: 'member'},
    {label: 'Администратор', value: 'participant'},
];

type Props = {
    setIsCreateChat: (close: boolean) => void
}

export const CreateChatScreen = ({setIsCreateChat}: Props) => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation()
    const {chatUsers} = useAppSelector(state => state.chats);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [userRoles, setUserRoles] = useState<Record<string, string>>({});
    const [chatTitle, setChatTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const disabled = !!chatTitle.trim() && selectedUsers.length > 0
    const [chatAvatar, setChatAvatar] = useState<any>(null);
    const [loader, setLoader] = useState(false)

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setChatAvatar(result.assets[0]); // сохраняем выбранное изображение
        }
    };

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

    const handleCreate = async () => {
        if (disabled) {

            const selectedData = selectedUsers.map(id => {
                const user = chatUsers.find(u => u.id === id);
                return {
                    id: id,
                    name: user?.name || '',
                    avatar: user?.avatar_path || null,
                    role: userRoles[id],
                };
            });

            const payload = {
                name: chatTitle.trim(),
                users: selectedData,
            };

            try {
                setLoader(true)
                const resultAction = await dispatch(createChat(payload));

                if (createChat.fulfilled.match(resultAction)) {
                    const chatId = resultAction.payload.id;

                    if (chatAvatar) {
                        await dispatch(uploadChatAvatar({chatId: +chatId, file: chatAvatar}));
                    }
                    await dispatch(fetchChatsList());
                    await dispatch(fetchChatMessages(+chatId));
                    await dispatch(fetchActiveUsers());
                    setIsCreateChat(false)
                    // @ts-ignore
                    navigation.navigate(ROUTES.CHAT_DETAIL, {name: chatTitle});
                } else {
                    console.warn('Ошибка создания чата:', resultAction.payload);
                }
            } catch (error) {
                console.error('Ошибка при создании чата:', error);
            } finally {
                setLoader(false)
            }
        } else {
            console.log('Введите название чата и выберите участников');
        }
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


    // Сброс состояния при размонтировании (переходе с экрана)
    useFocusEffect(
        useCallback(() => {
            return () => {
                setSelectedUsers([]);
                setUserRoles({});
                setChatTitle('');
                setSearchQuery('');
                setChatAvatar(null);
            };
        }, [])
    );


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
                    <Text style={[GlobalStyle.titleGL, {marginBottom: 0}]}>Создание чата</Text>
                    <IconButton
                        icon="close"
                        iconColor={Colors.textBlack}
                        style={{
                            margin: 0,
                        }}
                        size={30}
                        onPress={() => setIsCreateChat(false)}
                    />
                </View>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={Colors.textGray}
                    placeholder="Введите название чата"
                    value={chatTitle}
                    onChangeText={setChatTitle}
                />
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
                <View style={{marginBottom: 10, alignItems: 'flex-start'}}>
                    <TouchableOpacity onPress={pickImage}>
                        {chatAvatar ? (
                            <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                                <Image
                                    source={{uri: chatAvatar.uri}}
                                    style={{width: 40, height: 40, borderRadius: 40}}
                                />
                                <IconButton
                                    icon="delete"
                                    iconColor={Colors.textBlack}
                                    size={20}
                                    style={{
                                        margin: 0,
                                        top: -10
                                    }}
                                    onPress={() => setChatAvatar(null)}
                                />
                            </View>
                        ) : (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <IconButton
                                    icon="file-image"
                                    iconColor={Colors.textBlack}
                                    style={{margin: 0}}
                                    size={20}
                                />
                                <Text style={{color: '#000'}}>Выбрать аватар</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </>
        )
    }

    const headerComponent = useMemo(() => renderHeader(), [chatTitle, searchQuery, chatAvatar]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >

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
                disabled={!disabled || loader}
                style={styles.button} onPress={handleCreate}>
                {loader &&
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator/>
                    </View>
                }
                <Text style={styles.buttonText}>Создать чат</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10
    },
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
    },
    pickerContainer: {
        //  marginRight: 10,
        //  flexShrink: 1,
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
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    userName: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#aaa',
    },
    radioSelected: {
        backgroundColor: '#4285F4',
        borderColor: '#4285F4',
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
