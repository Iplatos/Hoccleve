import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from "../../../services/axios/axiosConfig.ts";

export interface ActiveUser {
    id: string; // ID пользователя
    name: string; // Полное имя пользователя
    avatar_path: string | null; // Путь к аватару, может быть null
}

export interface ActiveUsersResponse {
    activeUsers: ActiveUser[]; // Список активных пользователей
    noReadMessages: unknown[]; // Массив непрочитанных сообщений
    notifications: unknown[]; // Массив уведомлений
}

interface ActiveUsersState {
    activeUsers: ActiveUser[]; // Список активных пользователей
    noReadMessages: unknown[]; // Непрочитанные сообщения
    notifications: unknown[]; // Уведомления
    status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Статус запроса
    error: string | null; // Ошибка, если она произошла
}

const initialState: ActiveUsersState = {
    activeUsers: [],
    noReadMessages: [],
    notifications: [],
    status: 'idle',
    error: null,
};

// Асинхронный экшен для получения списка активных пользователей
export const fetchActiveUsers = createAsyncThunk<
    ActiveUsersResponse, // Тип возвращаемого значения
    void, // Аргументы (в данном случае не нужны)
    { rejectValue: string } // Тип ошибки
>(
    'chat/fetchActiveUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/v1/chat/get-active-users');
            return response.data as ActiveUsersResponse;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Ошибка при загрузке активных пользователей');
        }
    }
);

const activeUsersSlice = createSlice({
    name: 'activeUsers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchActiveUsers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchActiveUsers.fulfilled, (state, action: PayloadAction<ActiveUsersResponse>) => {
                state.status = 'succeeded';
                state.activeUsers = action.payload.activeUsers;
                state.noReadMessages = action.payload.noReadMessages;
                state.notifications = action.payload.notifications;
            })
            .addCase(fetchActiveUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Неизвестная ошибка';
            });
    },
});

export default activeUsersSlice.reducer;
