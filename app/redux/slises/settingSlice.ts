import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios/instans.ts";
import { isAxiosError } from "axios";

export interface Setting {
    key: string;
    value: string;
    type: string;
}
interface RegisterPushTokenParams {
    push_token: string;
    platform?: 'ios' | 'android';
}

export interface Platform {
    path: string;
    name: string;
}


export interface SettingsState {
    data: Setting[];
    pushTokenData: any | null;
    platforms: Platform[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    platformStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Запрос за настройками
export const fetchSettings = createAsyncThunk<Setting[], void, { rejectValue: string }>(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/v1/setting/get-all');
            return response.data;
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            // @ts-ignore
            return rejectWithValue(err.message);
        }
    }
);

// Запрос за платформами
export const fetchPlatforms = createAsyncThunk<Platform[], void, { rejectValue: string }>(
    'settings/fetchPlatforms',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/v1/setting/list-platforms');
            return response.data.data;
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            // @ts-ignore
            return rejectWithValue(err.message);
        }
    }
);



export const registerPushToken = createAsyncThunk<
    any, // или тип ответа от сервера
    RegisterPushTokenParams,
    { rejectValue: string }
>(
    'userDevice/registerPushToken',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/v1/user-device/register', {
                push_token: params.push_token,
                platform: params.platform, // можно не передавать, если не требуется
            });

            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || 'Не удалось зарегистрировать токен'
            );
        }
    }
);

const initialState: SettingsState = {
    data: [],
    platforms: [],
    pushTokenData: null,
    status: 'idle',
    platformStatus: 'idle',
    error: null,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Обработка запроса за настройками
            .addCase(fetchSettings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<Setting[]>) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchSettings.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || 'Something went wrong';
            })
            // Обработка запроса за платформами
            .addCase(fetchPlatforms.pending, (state) => {
                state.platformStatus = 'loading';
            })
            .addCase(fetchPlatforms.fulfilled, (state, action: PayloadAction<Platform[]>) => {
                state.platformStatus = 'succeeded';
                state.platforms = action.payload;
            })
            .addCase(fetchPlatforms.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.platformStatus = 'failed';
                state.error = action.payload || 'Something went wrong';
            })
            .addCase(registerPushToken.pending, (state) => {
                state.platformStatus = 'loading';
            })
            .addCase(registerPushToken.fulfilled, (state, action: PayloadAction<Platform[]>) => {
                state.platformStatus = 'succeeded';
                state.pushTokenData = action.payload;
            })
            .addCase(registerPushToken.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.platformStatus = 'failed';
                state.error = action.payload || 'Something went wrong';
            });
    },
});

export default settingsSlice.reducer;
