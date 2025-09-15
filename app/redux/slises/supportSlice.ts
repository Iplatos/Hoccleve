import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from "../../services/axios/axiosConfig.ts";

// Определяем типы для параметров и ответа
interface SupportRequest {
    message: string;
    support_type: string;
    files: File[];
}

interface SupportResponse {
    status: string;
    data: {
        message: string;
        direction_id: number | null;
        support_type: string;
        executor_comment: string | null;
        files: Array<{
            name: string;
            tempName: string;
            type: string;
            size: number;
            error: number;
            fullPath: string | null;
        }>;
    };
}

// Создаем асинхронное действие для отправки запроса
export const createSupportRequest = createAsyncThunk<SupportResponse, SupportRequest>(
    'support/createSupportRequest',
    async ({ message, support_type, files }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('message', message);
            formData.append('support_type', support_type);

            files.forEach((file) => {
                formData.append('files[]', file);
            });

            const response = await axiosInstance.post<SupportResponse>(
                '/v1/support/create',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Создаем slice для обработки состояния
interface SupportState {
    loading: boolean;
    error: string | null;
    data: SupportResponse | null;
}

const initialState: SupportState = {
    loading: false,
    error: null,
    data: null,
};

const supportSlice = createSlice({
    name: 'support',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createSupportRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.data = null;
            })
            .addCase(createSupportRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(createSupportRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default supportSlice.reducer;
