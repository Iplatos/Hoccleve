
export interface Banner {
    id: number;
    title: string;
    subtitle: string | null;
    description: string;
    textButton: string;
    linkButton: string;
    colorButton: string;
    colorTextButton: string;
    colorText: string;
    background: string;
    group: string;
    image: string;
    role: string;
    type: string;
}

// store/bannerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { isAxiosError } from 'axios';
import axiosInstance from '../../services/axios/instans.ts';

interface BannerState {
    banners: Banner[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: BannerState = {
    banners: [],
    status: 'idle',
    error: null
};

export const fetchBanners = createAsyncThunk<Banner[],  string , { rejectValue: string }>(
    'banners/fetchBanners',
    async ( group , { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/v1/banner/index', {
                params: {
                    'group': group
                },
            });
            return response.data;
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data.message || 'Ошибка запроса');
            }
            // @ts-ignore
            alert('Ошибка запроса за банерами')
            return rejectWithValue('Ошибка запроса');
        }
    }
);

const bannerSlice = createSlice({
    name: 'banners',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBanners.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchBanners.fulfilled, (state, action: PayloadAction<Banner[]>) => {
                state.status = 'succeeded';
                state.banners = action.payload;
            })
            .addCase(fetchBanners.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    }
});

export default bannerSlice.reducer;
