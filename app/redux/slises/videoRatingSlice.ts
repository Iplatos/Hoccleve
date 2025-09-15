import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from "../../services/axios/axiosConfig.ts";

interface RatingData {
    id: number;
    video_id: number;
    voting_id: number;
    rating: number;
    created_at: number;
}

interface VideoRatingState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    data: RatingData[];
    error: string | null;
}

const initialState: VideoRatingState = {
    status: 'idle',
    data: [],
    error: null,
};

// Async thunk to fetch the video rating
export const fetchVideoRating = createAsyncThunk(
    'videoRating/fetchVideoRating',
    async (videoId: number) => {
        const response = await axiosInstance.get(`/v1/topic-lesson/own-lesson-video-rating?videoId=${videoId}`);
        return response.data.data as RatingData[];
    }
);

const videoRatingSlice = createSlice({
    name: 'videoRating',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVideoRating.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchVideoRating.fulfilled, (state, action: PayloadAction<RatingData[]>) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchVideoRating.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Something went wrong';
            });
    },
});

export default videoRatingSlice.reducer;
