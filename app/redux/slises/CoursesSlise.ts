
import axiosInstance from "../../services/axios/axiosConfig.ts";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface DataItem {
    id: number;
    direction_id: number;
    children_id: number;
    tariff_id: number;
    learning_class: string | null;
    teacher_id: number;
    group_id: number | null;
    buy_months: number | null;
    buy_hours: string;
    status_payment: number;
    comment: string | null;
    distribution: number;
    payment_amount: string;
    next_payment_date: string | null;
    created_at: number;
    updated_at: number;
    countParentReports: number;
    data_filled: number;
    send_to_bot: number;
    parent_touch: number;
    is_disabled: number;
    auto_renewal: boolean;
    class_id: number | null;
}

export interface Links {
    href: string;
}

export interface Meta {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
}

export interface ApiResponse {
    data: DataItem[];
    _links: {
        self: Links;
        first: Links;
        last: Links;
        next: Links;
    };
    _meta: Meta;
}




// Состояние
interface ApiState {
    studentCourses: DataItem[];
    allCourses: DataItem[];
    loading: boolean;
    error: string | null;
}

const initialState: ApiState = {
    studentCourses: [],
    allCourses: [],
    loading: false,
    error: null,
};

// Асинхронный thunk для запроса курсов студента
export const fetchStudentCourses = createAsyncThunk<ApiResponse, number>(
    'courses/fetchStudentCourses',
    async (childrenId) => {
        try {
            const response = await axiosInstance.get<ApiResponse>(
                `/v1/direction-orders`,
                {
                    params: {
                        'filter[children_id][eq]': childrenId,
                       // 'filter[status_payment][eq]': 1,
                        'filter[is_disabled][eq]': 0,
                        expand: 'direction,tariff,class.classUser',
                        pageSize: false
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            throw new Error(error?.response?.data?.message || 'Не удалось получить данные о курсах студента');
        }
    }
);

// Асинхронный thunk для запроса всех курсов
export const fetchAllCourses = createAsyncThunk<ApiResponse>(
    'courses/fetchAllCourses',
    async () => {
        try {
            const response = await axiosInstance.get<ApiResponse>(
                '/v1/direction',
                {
                    params: {
                        'filter[filter_id][eq]': 16,
                        'filter[direction_id][nin][]': '32,26,33',
                        'filter[view][eq]': 1,
                        expand: 'directionTariffs'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            throw new Error(error?.response?.data?.message || 'Не удалось получить данные о всех курсах');
        }
    }
);
// Создание slice
const coursesSlice = createSlice({
     name: 'courses',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentCourses.fulfilled, (state, action) => {
                state.studentCourses = action.payload.data;
                state.loading = false;
            })
            .addCase(fetchStudentCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Что-то пошло не так';
            })
            .addCase(fetchAllCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllCourses.fulfilled, (state, action) => {
                state.allCourses = action.payload.data;
                state.loading = false;
            })
            .addCase(fetchAllCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Что-то пошло не так';
            });
    },
});

export default coursesSlice.reducer;























// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import axios from 'axios';
// import axiosInstance from "../../services/axios/axiosConfig.ts";
// import {Direction} from "./calendarSlice.ts";
//
// interface DirectionTariff {
//     id: number;
//     direction_id: number;
//     name: string;
//     description: string;
//     gpa: number;
//     first_price: string;
//     second_price: string;
//     third_price: string;
//     type: string;
//     old_price: string;
//     attached_groups: number | null;
//     isAttached_groups: number;
//     visibility_cources: number;
//     any_seminarian: boolean;
//     currency: string;
//     has_paid_cancel: number;
//     paid_cancel_student: number;
//     paid_cancel_teacher: number;
// }
//
//
// export interface Course extends Direction {
//     directionTariffs: DirectionTariff[];
// }
//
// interface FetchCoursesParams {
//     filterId: number;
//     directionIdNin: string;
//     view: number;
// }
//
//
// interface CoursesState {
//     courses: Course[];
//     status: 'idle' | 'loading' | 'succeeded' | 'failed';
//     error: string | null;
// }
//
//
// const initialState: CoursesState = {
//     courses: [],
//     status: 'idle',
//     error: null,
// };
//
// export const fetchDirections = createAsyncThunk<
//     Course[],
//     FetchCoursesParams,
//     { rejectValue: string }
// >('directions/fetchDirections', async (params, { rejectWithValue }) => {
//     try {
//         const response = await axiosInstance.get('/v1/direction/', {
//             params: {
//                 'filter[children_id][eq]': '107',
//                 'filter[status_payment][eq]': '1',
//
//                 'filter[filter_id][eq]': params.filterId,
//                 'filter[direction_id][nin][]': params.directionIdNin,
//                 'filter[view][eq]': params.view,
//                 'expand': 'directionTariffs',
//             },
//         });
//         return response.data.data;
//     } catch (err) {
//         if (axios.isAxiosError(err) && err.response) {
//             return rejectWithValue(err.response.data.message || 'Ошибка запроса');
//         }
//         return rejectWithValue('Ошибка запроса');
//     }
// });
//
// // Создание slice
// const coursesSlice = createSlice({
//     name: 'courses',
//     initialState,
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchDirections.pending, (state) => {
//                 state.status = 'loading';
//                 state.error = null;
//             })
//             .addCase(fetchDirections.fulfilled, (state, action: PayloadAction<Course[]>) => {
//                 state.status = 'succeeded';
//                 state.courses = action.payload;
//             })
//             .addCase(fetchDirections.rejected, (state, action) => {
//                 state.status = 'failed';
//                 state.error = action.payload as string;
//             });
//     },
// });
//
// export default coursesSlice.reducer;
