import axios from "axios";
import axiosInstance from "../../services/axios/axiosConfig.ts";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface VideoRatingResponse {
    voting_id: number;    // Идентификатор голосования
    video_id: number;     // Идентификатор видео
    rating: number;       // Оценка
    created_at: number;   // Дата создания оценки
    id: number;           // Уникальный идентификатор записи
    status: string;       // Статус ответа
}

// Типизация состояния
interface VideoRatingState {
    data: VideoRatingResponse | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: VideoRatingState = {
    data: null,
    status: 'idle',
    error: null,
};

export const submitVideoRating = createAsyncThunk<
    VideoRatingResponse,   // Тип возвращаемого значения
    { videoId: number; rating: number },  // Параметры запроса
    { rejectValue: string }  // Тип ошибки
>(
    'video/submitRating',
    async ({ videoId, rating }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post<VideoRatingResponse>(
                `/v1/topic-lesson/set-video-rating?videoId=${videoId}`,
                { rating }
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                const errorData = err.response.data;
                // Проверяем наличие данных ошибки и их формат
                if (typeof errorData === 'object' && 'error' in errorData) {
                    return rejectWithValue(errorData.error.join(', ') || 'Ошибка при отправке оценки');
                }
                return rejectWithValue('Ошибка при отправке оценки');
            }
            return rejectWithValue('Ошибка при отправке оценки');
        }
    }
);

const videoRatingSlice = createSlice({
    name: 'videoRating',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(submitVideoRating.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(submitVideoRating.fulfilled, (state, action: PayloadAction<VideoRatingResponse>) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(submitVideoRating.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload || 'Неизвестная ошибка';
            });
    },
});

export default videoRatingSlice.reducer;
