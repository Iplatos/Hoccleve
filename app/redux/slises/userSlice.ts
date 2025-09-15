import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {isAxiosError} from 'axios';
import axiosInstance from "../../services/axios/instans.ts";
import {fetchSettings} from "./settingSlice.ts";
import {fetchMenu} from "./menuSlice.ts";
import {fetchNews} from "./newsSlice.ts";
import {fetchBanners} from "./bannerSlice.ts";
import {reportsOwnBacklog} from "./reportsSlice.ts";
import {fetchStudentCourses} from "./studentCoursesSlice.ts";
import {fetchCalendar, fetchCalendarBySeminarian} from "./calendarSlice.ts";
import {initialDate} from "../../settings/Settings.ts";
import {fetchDirectionsBySeminarian} from "./seminarian/directionsBySeminarianSlice.ts";
import {fetchConferencesWithoutStatus} from "./conferenceWithoutStatusSlice.ts";
import {fetchActiveUsers} from "./chat/activeUsersSlice.ts";
import moment from "moment";
// Определяем интерфейс для состояния пользователя
interface UserState {
    user: User | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    isLoadingUser: boolean,   // Загрузка данных пользователя
    isLoadingStudent: boolean, // Загрузка данных для студента
    isLoadingSeminarian: boolean, // Загрузка данных для семинариста
}

export type UserRole = "children" | "seminarian"

interface UserProfile {
    sex: string;
    profile_photo: string | null;
    about: string;
    about_student: string | null;
    address: string;
    birth_date: Date;
    city: string;
    contracts: any | null;
    education: any | null;
    experience: any | null;
    learning_class: any | null;
    link_to_vk: string;
    notes: string;
    parent_name: string | null;
    parent_phone: string | null;
    parent_telegram: string | null;
    parent_whatsapp: string | null;
    timezone: string | null;
    url_conference: string;
}

export interface User {
    avatar_path: string;
    balance: number;
    balance_dollar: number;
    balance_euro: number;
    created_at: number;
    custom_id: string | null;
    email: string;
    id: number;
    name: string;
    phone: string;
    position_rating: number | null;
    promo_code: string | null;
    pulses: number;
    reportParents: any[];
    roles: { item_name: string }[];
    status: number;
    updated_at: number;
    userProfile: UserProfile;
}

// Начальное состояние
const initialState: UserState = {
    user: null,
    status: 'idle',
    isLoadingUser: false,   // Загрузка данных пользователя
    isLoadingStudent: false, // Загрузка данных для студента
    isLoadingSeminarian: false, // Загрузка данных для семинариста
    error: null
};


// Асинхронный thunk для запроса пользователя

export const fetchUser = createAsyncThunk<User, number, { rejectValue: string }>(
    'user/fetchUser',
    async (userId, { rejectWithValue, dispatch }) => {
        dispatch(setLoadingUser(true)); // Начало загрузки
        try {
            const response = await axiosInstance.get<User>(`/v1/user/view/${userId}`, {
                params: {
                    expand: 'roles,userProfile',
                },
            });
            return response.data;
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            return rejectWithValue(err.message);
        } finally {
            dispatch(setLoadingUser(false)); // Завершение загрузки
        }
    }
);

export const fetchStudentFullDataThunk = createAsyncThunk<void, number, { rejectValue: string }>(
    'student/fetchFullData',
    async (userId, { dispatch, rejectWithValue }) => {
        dispatch(setLoadingStudent(true))

        try {
            await dispatch(fetchSettings());
            await dispatch(fetchBanners('main'));
            await dispatch(fetchMenu({ language: null, menuType: 'mobile' }));
            await dispatch(fetchMenu({ language: null, menuType: 'basic' }));
            await dispatch(fetchNews());
            await dispatch(reportsOwnBacklog());
            await dispatch(fetchStudentCourses());
            await dispatch(fetchCalendar({
                start: moment().startOf("month").format("YYYY-MM-DD"),
                end: moment().endOf("month").format("YYYY-MM-DD"),
                type: "my",
                filters: {
                    seminarians: [],
                    childrens: [],
                    groupsAndClasses: [],
                    direction: null,
                    seminariansInCourses: [],
                }
            }));
            await dispatch(fetchActiveUsers());
        } catch (err) {
            return rejectWithValue('Ошибка при загрузке данных студента');
        } finally {
            console.log('fetchStudentFullDataThunk')
            dispatch(setLoadingStudent(false))
        }
    }
);

export const fetchSeminarianFullDataThunk = createAsyncThunk<void, number, { rejectValue: string }>(
    'seminarian/fetchFullData',
    async (userId, { dispatch, rejectWithValue }) => {
        dispatch(setLoadingSeminarian(true))
        try {

            await dispatch(fetchDirectionsBySeminarian(userId));
            await dispatch(fetchSettings());
            await dispatch(fetchBanners('main'));
            await dispatch(fetchMenu({ language: null, menuType: 'mobile' }));
            await dispatch(fetchMenu({ language: null, menuType: 'basic' }));
            await dispatch(fetchNews());
            await dispatch(fetchCalendar({
                start: moment().startOf("month").format("YYYY-MM-DD"),
                end: moment().endOf("month").format("YYYY-MM-DD"),
                type: "my",
                filters: {
                    seminarians: [userId],
                    childrens: [],
                    groupsAndClasses: [],
                    direction: null,
                    seminariansInCourses: [],
                }
            }));
            await dispatch(fetchConferencesWithoutStatus());
            await dispatch(fetchActiveUsers());
        } catch (err) {
            return rejectWithValue('Ошибка при загрузке данных семинариста');
        } finally {
            dispatch(setLoadingSeminarian(false))
        }
    }
);


// Создание slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
           // state.isLoading = action.payload;
        },
        setLoadingUser(state, action) {
            state.isLoadingUser = action.payload;
        },
        setLoadingStudent(state, action) {
            state.isLoadingStudent = action.payload;
        },
        setLoadingSeminarian(state, action) {
            state.isLoadingSeminarian = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
               // state.isLoading = true;
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.status = 'succeeded';
                state.user = action.payload;
            //    state.isLoading = false;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
             //   state.isLoading = false;
            });
    }
});

export const { setLoading,setLoadingUser,setLoadingStudent, setLoadingSeminarian  } = userSlice.actions;
export default userSlice.reducer;


// export const fetchUser = createAsyncThunk<User, number, { rejectValue: string }>(
//     'user/fetchUser',
//     async (userId, { rejectWithValue, dispatch }) => {
//         try {
//             // Устанавливаем флаг загрузки
//             dispatch(setLoading(true));
//
//             const response = await axiosInstance.get<User>(`/v1/user/view/${userId}`, {
//                 params: {
//                     'expand': 'roles,userProfile',
//                 },
//             });
//
//             // Последовательный запуск остальных запросов
//             await dispatch(fetchSettings());
//             await dispatch(fetchBanners('main'));
//             await dispatch(fetchMenu({ language: null, menuType: 'mobile' }));
//             await dispatch(fetchMenu({ language: null, menuType: 'basic' }));
//             await dispatch(fetchNews());
//             await dispatch(reportsOwnBacklog());
//             await dispatch(fetchStudentCourses());
//             await dispatch(fetchCalendar(initialDate));
//
//             return response.data;
//         } catch (err) {
//             if (isAxiosError(err) && err.response) {
//                // alert(err.response);
//                 return rejectWithValue(err.response.data);
//             }
//             return rejectWithValue(err.message);
//         } finally {
//             // Сбрасываем флаг загрузки
//             dispatch(setLoading(false));
//         }
//     }
// );
