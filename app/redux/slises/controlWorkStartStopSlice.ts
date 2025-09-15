import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../services/axios/axiosConfig.ts";

// Асинхронный thunk для старта или паузы работы
export const toggleControlWork = createAsyncThunk(
    'controlWork/toggleControlWork',
    async ({ isRunning, id }: { isRunning: boolean, id: number }) => {
        const url = isRunning
            ? `/v1/control-work/stop-work?id=${id}`
            : `/v1/control-work/start-work?id=${id}`;

        const response = await axiosInstance.post(url);
        return response.data;
    }
);

interface ControlWorkState {
    data: any;
    loading: boolean;
    error: string | null;
    isRunning: boolean;
}

const initialState: ControlWorkState = {
    data: null,
    loading: false,
    error: null,
    isRunning: false,
};

const controlWorkStartStopSlice = createSlice({
    name: 'controlWorkStartStopSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(toggleControlWork.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleControlWork.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.isRunning = action.payload.data.status === 1; // статус 1 — запущено, статус 2 — на паузе
            })
            .addCase(toggleControlWork.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Ошибка при изменении состояния работы';
            });
    },
});

export default controlWorkStartStopSlice.reducer;
