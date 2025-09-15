import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios/instans.ts";

export interface MenuFolder {
    id: number;
    title: string;
    auth_item_name: string;
    menu_type: string;
    rank: number;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface MenuItem {
    id: number;
    folder_id: number | null;
    name: string;
    title: string;
    icon: string;
    url: string;
    is_custom: number;
    has_notify: number;
    rank: number;
    is_active: boolean;
    noticeCount: number | null;
}

export interface MenuSection {
    folder: MenuFolder | null;
    items: MenuItem[];
}

export interface MenuState {
    basicItems: MenuSection[];
    mobileItems: MenuItem[];
    basicStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    mobileStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    basicError: string | null;
    mobileError: string | null;
}

export const fetchMenu = createAsyncThunk<
    MenuSection[] | MenuItem[],
    { language: string | null; menuType: 'basic' | 'mobile' },
    { rejectValue: string }
>(
    'menu/fetchMenu',
    async ({ language, menuType }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get<MenuSection[] | MenuItem[]>(
                `/v1/menu/get-active-menu`,
                {
                    params: {
                        language,
                        menuType,
                    },
                }
            );
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const initialMenuState: MenuState = {
    basicItems: [],
    mobileItems: [],
    basicStatus: 'idle',
    mobileStatus: 'idle',
    basicError: null,
    mobileError: null,
};

const menuSlice = createSlice({
    name: 'menu',
    initialState: initialMenuState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenu.pending, (state, action) => {
                if (action.meta.arg.menuType === 'basic') {
                    state.basicStatus = 'loading';
                } else {
                    state.mobileStatus = 'loading';
                }
            })
            .addCase(fetchMenu.fulfilled, (state, action) => {
                if (action.meta.arg.menuType === 'basic') {
                    state.basicStatus = 'succeeded';
                    state.basicItems = action.payload as MenuSection[];
                } else {
                    state.mobileStatus = 'succeeded';
                    state.mobileItems = action.payload as MenuItem[];
                }
            })
            .addCase(fetchMenu.rejected, (state, action) => {
                if (action.meta.arg.menuType === 'basic') {
                    state.basicStatus = 'failed';
                    state.basicError = action.payload || 'Что-то пошло не так';
                } else {
                    state.mobileStatus = 'failed';
                    state.mobileError = action.payload || 'Что-то пошло не так';
                }
            });
    },
});

export default menuSlice.reducer;
