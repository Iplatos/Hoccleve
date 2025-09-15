import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from "../../services/axios/axiosConfig.ts";
import {Type} from "./studentCoursesSlice.ts";

export interface BlockTheme {
    id: number;
    name: string;
    description: string;
    isActive: number;
    sorting: number;
    totalCount: number;
    topicLesson: {
        id: string;
        material_id: string;
        name: string;
        type: string;
    }[];
    finishedCount: string;
    type: string;
}

interface BlockThemesState {
    data: BlockTheme[];
    block_name: string;
    passed_percents: number;
    loading: boolean;
    error: string | null;
}

const initialState: BlockThemesState = {
    data: [],
    block_name: '',
    passed_percents: 0,
    loading: false,
    error: null,
};

export const fetchBlockThemes = createAsyncThunk(
    'blockThemes/fetchBlockThemes',
    async ({groupId, blockId, type}: { groupId?: number; blockId: number, type?: Type }, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(`/v1/direction-plan-beta/get-block-themes`, {
                params: {groupId, blockId, type: type},
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки данных');
        }
    }
);

const blockThemesSlice = createSlice({
    name: 'blockThemes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBlockThemes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlockThemes.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.block_name = action.payload.block_name;
                state.passed_percents = action.payload.passed_percents;
            })
            .addCase(fetchBlockThemes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default blockThemesSlice.reducer;
