import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import axiosInstance from "../../services/axios/axiosConfig.ts";

interface HomeworkTimerState {
    data: Record<number, string | null>; // task_id -> ISO string | null
    loading: boolean;
    error: string | null;
}

const initialState: HomeworkTimerState = {
    data: {},
    loading: false,
    error: null,
};

export const fetchHomeworkTimer = createAsyncThunk<
    { task_id: number; started_at: string | null },
    { task_id: number; work_id: number },
    { rejectValue: string }
>(
    'homeworkTimer/fetch',
    async ({task_id, work_id}, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(`/v1/home-work/get-timer`, {
                params: {task_id, work_id},
            });

            if (response.data.status === 'success') {
                return {task_id, started_at: response.data.data};
            } else {
                return rejectWithValue('Ошибка: не удалось получить таймер');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка запроса');
        }
    }
);

export const startHomeworkTimer = createAsyncThunk<
    { task_id: number; time: string },
    { task_id: number; work_id: number },
    { rejectValue: string }
>(
    'homeworkTimer/start',
    async ({ task_id, work_id }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/v1/home-work/start-timer', {
                task_id,
                work_id,
            });

            if (response.data.status === 'success') {
                return {
                    task_id,
                    time: response.data.data, // строка времени
                };
            } else {
                return rejectWithValue('Ошибка: не удалось запустить таймер');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка запроса');
        }
    }
);


const homeworkTimerSlice = createSlice({
    name: 'homeworkTimer',
    initialState,
    reducers: {
        clearHomeworkTimer: (state) => {
            state.data = {};
            state.error = null;
            state.loading = false;
        },
        clearTimerByTaskId: (state, action: PayloadAction<number>) => {
            delete state.data[action.payload];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHomeworkTimer.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHomeworkTimer.fulfilled, (state, action) => {
                state.loading = false;
                const {task_id, started_at} = action.payload;
                state.data[task_id] = started_at;
            })
            .addCase(fetchHomeworkTimer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Ошибка';
            })
            .addCase(startHomeworkTimer.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(startHomeworkTimer.fulfilled, (state, action) => {
                const { task_id, time } = action.payload;
                state.data[task_id] = time;
                state.loading = false;
            })
            .addCase(startHomeworkTimer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Неизвестная ошибка при запуске таймера';
            })

    }
});

export const {clearHomeworkTimer} = homeworkTimerSlice.actions;
export default homeworkTimerSlice.reducer;
