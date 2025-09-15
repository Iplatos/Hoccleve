import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import axios, {isAxiosError} from 'axios';
import axiosInstance from '../../../services/axios/instans.ts';

export interface ChatMember {
    id: number;
    name: string;
    avatar: string | null;
    noReadCount: string;
}

interface FixChatResponse {
    success: boolean;
}

// Тип для удаления сообщения
interface RemoveMessageArgs {
    messageId: number;
    chatId: number;
}


interface ChatMemberGetChat {
    user_id: number;
    member_id: number;
    name: string;
    avatar: string | null;
    role: number;
    isCreator: number;
}

export interface LastMessage {
    id: number;
    message: string;
    author: string;
    authorAvatar: string;
}

export interface ChatList {
    id: number;
    name: string | null;
    avatar: string | null;
    members: ChatMember[];
    lastMessage: LastMessage | null;
    isFixed: boolean;
    muted: boolean;
}


export interface Chat {
    id: string; // ID пользователя чата
    name: string; // Полное имя пользователя
    avatar_path: string | null; // Путь к аватару пользователя, может быть null
    value: string; // Значение, совпадающее с ID
}


interface ChatMessage {
    id: number;
    user_id: number;
    author: number;
    message: string;
    parentId: number | null;
    createdAt: string;
    files: any[]; // уточни тип, если есть структура файлов
}

interface ChatMessagesResponse {
    id: number;
    name: string | null;
    avatar: string | null;
    members: ChatMemberGetChat[];
    fixedMessage: {
        id: number,
        message: string
    }; // можно уточнить тип
    messages: ChatMessage[];
}

export interface ChatUser {
    id: string;
    name: string;
    avatar_path: string | null;
    value: string;
    role: number;
}

export interface CreateChatRequest {
    chatImage?: string | null;
    name?: string | null;
    users: ChatUser[];
}

export interface CreateChatResponse {
    id: number;
    name: string;
}
export type AddMemberUsersPayload = {
    id: number;
    name: string;
    avatar: string | null;
    role: string;
}
export type AddMemberPayload = {
    chatId: number;
    users: AddMemberUsersPayload[];
}


interface ChatState {
    chats: ChatList[];
    selectedChat: ChatMessagesResponse | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    chatMessagesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    chatUsers: Chat[];
}

const initialState: ChatState = {
    chats: [],
    selectedChat: null,
    status: 'idle',
    chatMessagesStatus: 'idle',
    error: null,
    chatUsers: [],
};


export const fetchChatsList = createAsyncThunk<ChatList[], void, { rejectValue: string }>(
    'chats/fetchChatsList',
    async (_, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get<ChatList[]>(
                '/v1/chat/chat-list?limit=1000'
            );
            return response.data;
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data.message || 'Ошибка запроса');
            }
            return rejectWithValue('Ошибка запроса');
        }
    }
);

export const createMessage = createAsyncThunk<
    { id: number },                                     // тип возвращаемого значения
    { chatId: number; message: string },                // тип аргументов
    { rejectValue: string }                            // тип ошибки
>(
    'chats/createMessage',
    async ({chatId, message}, {dispatch, rejectWithValue}) => {
        try {
            const response = await axiosInstance.post('/v1/chat/create-message', {
                chatId,
                message: JSON.stringify(message),
            });
            dispatch(fetchChatMessages(chatId))
            return response.data; // ожидается { id: number }
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data.message || 'Ошибка при отправке сообщения');
            }
            return rejectWithValue('Ошибка при отправке сообщения');
        }
    }
);

export const addChatMembers = createAsyncThunk<
    { success: boolean },        // что возвращает
    AddMemberPayload             // что принимает
>(
    'chat/addMembers',
    async (payload, {dispatch, rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/v1/chat/add-member', payload);
            dispatch(fetchChatMessages(payload.chatId))
            return response.data; // { success: true }
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { error: 'Ошибка при добавлении участников' });
        }
    }
);


export const removeChatMember = createAsyncThunk<
    { success: boolean },              // тип успешного ответа
    { memberId: number },             // аргумент (payload)
    { rejectValue: string }           // тип ошибки
>(
    'chat/removeMember',
    async ({ memberId }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(
                `/v1/chat/remove-member/${memberId}`
            );

            return response.data; // ожидается: { success: true }
        } catch (error: any) {
            const message =
                error.response?.data?.message || 'Ошибка при удалении участника чата';
            return rejectWithValue(message);
        }
    }
);

export const updateChatMemberRole = createAsyncThunk<
    { success: boolean;  }, // Возвращаемое значение
    {memberId: number; role: number, chatId: number} // Аргументы
>(
    'chat/updateMemberRole',
    async ({ memberId, role, chatId }, { dispatch, rejectWithValue }) => {
        try {
            await axiosInstance.put(`/v1/chat/update-member/${memberId}`, {
                role,
            });

            // Обновляем данные чата и список чатов
            await dispatch(fetchChatMessages(chatId))
            return { success: true, };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || { error: 'Ошибка при обновлении роли' }
            );
        }
    }
);

export const removeMessage = createAsyncThunk<
    { success: boolean; messageId: number }, // Возвращаемый результат
    RemoveMessageArgs // Аргумент
>(
    'chat/removeMessage',
    async ({messageId, chatId}, {dispatch, rejectWithValue}) => {
        try {
            const response = await axiosInstance.delete(
                `/v1/chat/remove-message/${messageId}`
            );
            await dispatch(fetchChatMessages(chatId))
            await dispatch(fetchChatsList());
            await dispatch(fetchChatUserNameList({}))

            return {success: true, messageId};
        } catch (error: any) {
            return rejectWithValue(error.response?.data || {error: 'Ошибка удаления'});
        }
    }
);

export const fixMessage = createAsyncThunk<
    { success: boolean }, // возвращаемое значение
    RemoveMessageArgs // аргументы
>(
    'chat/fixMessage',
    async ({ messageId, chatId }, {dispatch, rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(
                `/v1/chat/fix-message/${messageId}`
            );
            dispatch(fetchChatMessages(chatId))
            return { success: response.data.success };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { error: 'Ошибка закрепления сообщения' });
        }
    }
);

export const unfixMessage = createAsyncThunk<
    { success: boolean }, // возвращаемое значение
    { chatId: number } // аргументы
>(
    'chat/unfixMessage',
    async ({chatId}, {dispatch, rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(
                `/v1/chat/unfix-message/${chatId}`
            );
            dispatch(fetchChatMessages(chatId))
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Ошибка при откреплении сообщения');
        }
    }
);

export const fetchChatMessages = createAsyncThunk<
    ChatMessagesResponse,
    number,
    { rejectValue: string }
>(
    'chats/fetchChatMessages',
    async (chatId, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(`/v1/chat/chat-messages/${chatId}`);
            return response.data;
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data.message || 'Ошибка загрузки сообщений чата');
            }
            return rejectWithValue('Ошибка загрузки сообщений чата');
        }
    }
);

export const fetchChatUserNameList = createAsyncThunk<
    Chat[],                          // Тип возвращаемого значения
    { search?: string },            // Аргументы (например, search строка)
    { rejectValue: string }         // Тип ошибки
>(
    'chats/fetchChatUserNameList',
    async ({search = ''}, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get<Chat[]>('/v1/chat/get-users-chat-name-list', {
                params: {search},
            });
            return response.data;
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data.message || 'Ошибка получения списка пользователей');
            }
            return rejectWithValue('Ошибка получения списка пользователей');
        }
    }
);

export const createChat = createAsyncThunk<CreateChatResponse, any>(
    'chat/createChat',
    async (payload, {rejectWithValue}) => {
        try {
            // Пример: если payload содержит только одного пользователя, оборачиваем его в users[]
            let finalPayload;

            if (payload?.users && Array.isArray(payload.users)) {
                finalPayload = payload;
            } else if (payload?.id && payload?.name) {
                finalPayload = {
                    name: payload.name,
                    users: [payload],
                };
            } else {
                throw new Error('Неверный формат payload');
            }

            const response = await axiosInstance.post<CreateChatResponse>(
                '/v1/chat/create-chat',
                finalPayload
            );

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
export const uploadChatAvatar = createAsyncThunk<
    { success: boolean }, // Тип ответа
    { chatId: number; file: any }, // Аргументы
    { rejectValue: string }
>(
    'chat/uploadChatAvatar',
    async ({chatId, file}, {rejectWithValue}) => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                name: file.fileName || 'chat_avatar.jpg',
                type: file.mimeType || 'image/jpeg',
            } as any);

            const response = await axiosInstance.post(
                `/v1/chat/update-chat-avatar/${chatId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data?.success) {
                return {success: true};
            } else {
                return rejectWithValue('Ошибка при обновлении аватара');
            }
        } catch (error) {
            return rejectWithValue('Ошибка при отправке файла');
        }
    }
);

export const deleteChatById = createAsyncThunk<
    { id: number },         // ✅ Тип успешного ответа
    number,                 // ✅ Тип аргумента (chatId)
    { rejectValue: string } // ✅ Тип ошибки
>(
    'chat/deleteChatById',
    async (chatId, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.delete(
                `/v1/chat/remove-chat/${chatId}`
            );

            // Если сервер сам не выбрасывает ошибку на 403, проверим статус вручную
            if (response.status !== 200) {
                return rejectWithValue('Ошибка при удалении чата');
            }

            return {id: chatId};
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error?.[0] || 'Ошибка при удалении чата';
            return rejectWithValue(errorMessage);
        }
    }
);

export const fixChatById = createAsyncThunk<
    FixChatResponse,      // Возвращаемые данные при успехе
    number,               // Аргумент — ID чата
    { rejectValue: string } // Тип ошибки
>(
    'chat/fixChatById',
    async (chatId, {dispatch, rejectWithValue}) => {
        try {
            const response = await axiosInstance.put(
                `/v1/chat/fix-chat/${chatId}`
            );

            if (response.data?.success) {
                dispatch(fetchChatsList())
                return response.data;
            } else {
                return rejectWithValue('Не удалось закрепить чат');
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.error?.[0] || 'Произошла ошибка при закреплении чата';
            return rejectWithValue(message);
        }
    }
);

export const unfixChat = createAsyncThunk<
    { success: boolean },
    void,
    { rejectValue: string }
>(
    'chats/unfixChat',
    async (_, {dispatch, rejectWithValue}) => {
        try {
            const response = await axiosInstance.put('/v1/chat/unfix-chat');
            if (response.data.success) {
                dispatch(fetchChatsList())
                return response.data;
            } else {
                return rejectWithValue('Ошибка при откреплении чата');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка сети');
        }
    }
);

export const muteChat = createAsyncThunk(
    'chat/mute',
    async (id: number, {dispatch, rejectWithValue}) => {
        try {
            const response = await axiosInstance.post(`/v1/chat/mute?id=${id}`);
            dispatch(fetchChatsList())
            return response.data; // Возвращаем данные из ответа
        } catch (error: any) {
            // Обработка ошибки
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message);
        }
    }
);

export const unMuteChat = createAsyncThunk(
    'chat/unMute',
    async (id: number, {dispatch, rejectWithValue}) => {
        try {
            const response = await axiosInstance.post(`/v1/chat/unmute?id=${id}`);
            dispatch(fetchChatsList())
            return response.data; // Возвращаем данные из ответа
        } catch (error: any) {
            // Обработка ошибки
            if (error.response && error.response.data) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message);
        }
    }
);

const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchChatsList.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchChatsList.fulfilled, (state, action: PayloadAction<ChatList[]>) => {
                state.status = 'succeeded';
                state.chats = action.payload;
            })
            .addCase(fetchChatsList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // createMessage
            .addCase(createMessage.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createMessage.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(createMessage.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchChatMessages.pending, (state) => {
                state.chatMessagesStatus = 'loading';
                state.error = null;
            })
            .addCase(fetchChatMessages.fulfilled, (state, action: PayloadAction<ChatMessagesResponse>) => {
                state.chatMessagesStatus = 'succeeded';
                state.selectedChat = action.payload;
            })
            .addCase(fetchChatMessages.rejected, (state, action) => {
                state.chatMessagesStatus = 'failed';
                state.error = action.payload as string;
            })

            .addCase(fetchChatUserNameList.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchChatUserNameList.fulfilled, (state, action: PayloadAction<Chat[]>) => {
                state.status = 'succeeded';
                state.chatUsers = action.payload;
            })
            .addCase(fetchChatUserNameList.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Ошибка получения пользователей';
            })

            .addCase(deleteChatById.fulfilled, (state, action) => {
                // Удаляем чат из списка
                state.chats = state.chats.filter(chat => chat.id !== action.payload.id);
            })
            .addCase(deleteChatById.rejected, (state, action) => {
                console.warn('Ошибка удаления чата:', action.payload);
            });
    },
});

export default chatSlice.reducer;
