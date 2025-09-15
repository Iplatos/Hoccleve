import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../services/axios/axiosConfig.ts";

interface PassWorkResponse {
    status: string;
    data: {
        id: number;
        children_id: number;
        verified_by_id: number | null;
        private_work_id: number | null;
        score: number;
        decided_right: boolean | null;
        status: number;
        type: string;
        view: number;
        expired_date: string;
        completed_date: number;
        direction_id: number;
        course_id: number;
        lesson_id: number;
        group_id: number;
        verified_date: string | null;
        deadline_date: string;
        comment: string | null;
        is_unique: number;
        mark: number | null;
        attempt: number;
        only_content: number;
        is_classwork: number;
        number_work: string | null;
        min_points_scored: boolean;
        can_redo: boolean;
    };
}

interface PassWorkState {
    loading: boolean;
    error: string | null;
    data: PassWorkResponse | null;
}



export const passWork = createAsyncThunk<PassWorkResponse, { id: number; isControlWork?: boolean }>(
    'homework/passWork',
    async ({ id, isControlWork = false }, { rejectWithValue }) => {
        try {
            const url = isControlWork
                ? `/v1/control-work/pass-work?id=${id}`
                : `/v1/home-work/pass-work?id=${id}`;

            const response = await axiosInstance.post<PassWorkResponse>(url);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Error');
        }
    }
);

const initialState: PassWorkState = {
    loading: false,
    error: null,
    data: null,
};

const passWorkSlice = createSlice({
    name: 'passWork',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(passWork.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(passWork.fulfilled, (state, action: PayloadAction<PassWorkResponse>) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(passWork.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default passWorkSlice.reducer;
