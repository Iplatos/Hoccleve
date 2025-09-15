import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axios/axiosConfig.ts';

// Типизация данных ответа от API
export interface UploadAbstractResponse {
    plan_id: string;          // Идентификатор плана
    children_id: number;      // Идентификатор ребенка
    status: number;           // Статус загрузки
    completed_date: number;   // Дата завершения загрузки
    id: number;               // Уникальный идентификатор конспекта
}
export interface UploadAbstractApiResponse {
    data: UploadAbstractResponse; // The nested data property
    status: string; // Or a more specific type if applicable
}

// Типизация состояния
interface UploadAbstractState {
    data: UploadAbstractApiResponse[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: UploadAbstractState = {
    data: [],
    status: 'idle',
    error: null,
};

// Асинхронный thunk для загрузки конспекта
export const uploadAbstract = createAsyncThunk<
    UploadAbstractApiResponse,
    FormData,
    { rejectValue: string }
>(
    'lesson/uploadAbstract',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post<UploadAbstractApiResponse>(
                '/v1/lesson-abstract/create',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.data) {
                const errorData = err.response.data;

                // Извлечение первой ошибки, если структура совпадает
                if (
                    Array.isArray(errorData.error) &&
                    errorData.error[0] &&
                    typeof errorData.error[0] === 'object'
                ) {
                    const firstKey = Object.keys(errorData.error[0])[0];
                    const message = errorData.error[0][firstKey]?.[0];
                    return rejectWithValue(message || 'Ошибка загрузки файла');
                }

                return rejectWithValue('Ошибка загрузки файла');
            }

            return rejectWithValue('Ошибка загрузки файла');
        }
    }
);

// Создание слайса
const uploadAbstractSlice = createSlice({
    name: 'uploadAbstract',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(uploadAbstract.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(uploadAbstract.fulfilled, (state, action: PayloadAction<UploadAbstractApiResponse>) => {
                state.status = 'succeeded';
                state.data = [...state.data, action.payload];
            })
            .addCase(uploadAbstract.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || 'Неизвестная ошибка';
            });
    },
});
export default uploadAbstractSlice.reducer;
