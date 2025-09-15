import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../services/axios/axiosConfig.ts";

// Типизация данных, отправляемых на сервер
export interface HomeWorkRequest {
    group_ids?: Group[];
    course_id: string;
    deadline_date: string;
    direction_id: number;
    lesson_id: number | undefined;
    material_id: string;
    material_type: string;
    type: string;
    children_ids?: [number | undefined]
    groups_childrens: GroupsChildrens
    only_content?: boolean,
    remove_check?: boolean,
    send_at?: boolean | null,
    is_classwork?: boolean,
}

type GroupsChildrens = {
    [key: number]: number[]; // Ключ - число (groupID), значение - массив чисел (userId)
};

interface Group {
    group_id?: number;
    children_ids:  [number | undefined];
}

// Типизация данных, получаемых от сервера
interface HomeWorkResponse {
    status: string;
    data: CreateHomeWorkData[];
}

export interface CreateHomeWorkData {
    is_unique: number;
    deadline_date: string;
    children_id: number;
    direction_id: number;
    group_id: number;
    view: number;
    type: string;
    course_id: number;
    lesson_id: number;
    status: number;
    only_content: boolean;
    is_classwork: boolean;
    id: number;
    number_work: number | null;
    min_points_scored: boolean;
    can_redo: boolean;
}

// Асинхронный thunk для отправки домашней работы и получения данных
export const setHomeWork = createAsyncThunk<CreateHomeWorkData, HomeWorkRequest>(
    'createHomeWork/setHomeWork',
    async (CreateHomeWorkData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post<HomeWorkResponse>('/v1/home-work/set-home-work-mass', CreateHomeWorkData);
            return response.data.data[0]; // Возвращаем первый объект с данными домашней работы
        } catch (error: any) {
            return rejectWithValue(error.response.data);
        }
    }
);

interface HomeWorkState {
    data: CreateHomeWorkData | null;
    loading: boolean;
    error: string | null;
}

const initialState: HomeWorkState = {
    data: null,
    loading: false,
    error: null,
};

const createHomeWorkSlice = createSlice({
    name: 'createHomeWork',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(setHomeWork.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(setHomeWork.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload; // Теперь тип данных соответствует HomeWorkData
            })
            .addCase(setHomeWork.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default createHomeWorkSlice.reducer;
