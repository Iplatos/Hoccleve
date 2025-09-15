import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from "../../services/axios/axiosConfig.ts";

interface Order {
    id: number;
    direction_id: number;
    children_id: number;
    tariff_id: number;
    learning_class: null | string;
    teacher_id: null | number;
    group_id: number;
    buy_months: number;
    buy_hours: null | number;
    status_payment: number;
    comment: null | string;
    distribution: number;
    payment_amount: string;
    next_payment_date: string;
    created_at: number;
    updated_at: number;
    countParentReports: number;
    data_filled: number;
    send_to_bot: number;
    parent_touch: number;
    is_disabled: number;
    auto_renewal: boolean;
    class_id: null | number;
}

interface Group {
    id: number;
    direction_id: number;
    teacher_id: number;
    name: string;
    created_at: number;
    updated_at: number;
    any_seminarian: number;
}

interface Direction {
    id: number;
    name: string;
    short_name: string;
    description: string;
    icon_path: string;
    created_at: number;
    updated_at: number;
    code: null | string;
    start_price: string;
    use_promo_code: number;
    seminarian_name: string;
    use_discount: number;
    filter_id: number;
    seminarian_id: number;
    permission_add_child: number;
    view: number;
    old_price: string;
    sorting: number;
    flag_easily_creating: number;
}

interface Teacher {
    avatar_path: string;
    balance: number;
    balance_dollar: number;
    balance_euro: number;
    created_at: number;
    custom_id: null | string;
    email: string;
    id: number;
    last_login: string;
    name: string;
    password: string;
    phone: string;
    position_rating: null | number;
    promo_code: null | string;
    pulses: number;
    reportParents: any[]; // Если известна структура элементов массива, можно уточнить тип
    status: number;
    updated_at: number;
}

export interface StudentCourse {
    order: Order;
    group: Group;
    direction: Direction;
    last_topic: string;
    deny_access: boolean;
    topicTotalCount: number;
    topicFinishedCount: number;
    teacher: Teacher
}

export type Type = 'group' | 'private'

interface StudentCoursesState {
    courses: StudentCourse[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    groupID: number | null;
    type: Type;
    course_id: number | null;
    blockID: number | null;
    themeID: number | null;

}

const initialState: StudentCoursesState = {
    courses: [],
    status: 'idle',
    error: null,
    groupID: null,
    type: "group",
    course_id: null,
    blockID: null,
    themeID: null
};

export const fetchStudentCourses = createAsyncThunk(
    'studentCourses/fetchStudentCourses',
    async () => {
        const response = await axiosInstance.get('/v1/direction-orders/get-student-directions');
        return response.data.data;
    }
);


const studentCoursesSlice = createSlice({
    name: 'studentCourses',
    initialState,
    reducers: {
        setGroupID: (state, action) => {
            state.groupID = action.payload;
        },
        setType: (state, action: PayloadAction<Type>) => {
            state.type = action.payload;
        },
        setCourseID: (state, action) => {
            state.course_id = action.payload;
        },
        setBlockID: (state, action) => {
            state.blockID = action.payload;
        },
        setThemeID: (state, action) => {
            state.themeID = action.payload;
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentCourses.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchStudentCourses.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.courses = action.payload;
            })
            .addCase(fetchStudentCourses.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch courses';
            });
    },
});

export const {
    setGroupID,
    setType,
    setCourseID,
    setBlockID,
    setThemeID
} = studentCoursesSlice.actions;
export default studentCoursesSlice.reducer;
