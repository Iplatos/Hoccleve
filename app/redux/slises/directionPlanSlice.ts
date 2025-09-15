import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios/axiosConfig.ts";

// interface Task {
//     id: number;
//     name: string;
//     description: string;
//     // другие поля, которые могут быть в задаче
// }
//
// interface LessonMaterial {
//     id: number;
//     name: string;
//     type: string;
//     url: string;
//     // другие поля, которые могут быть в материале урока
// }
//
// interface LessonVideo {
//     lesson_id: number,
//     link: string,
//     file: File | null,
//     rating_bad: number,
//     rating_not_bad: number,
//     rating_good: number,
//     rating_super: number
//     id: number;
//     name: string;
//     url: string;
//     duration: number;
//     // другие поля, которые могут быть в видео урока
// }
//
// interface Lesson {
//     id: number;
//     name: string;
//     lessonTasks: Task[];
//     lessonVideos: LessonVideo[];
//
//     // другие поля, которые могут быть в уроке
// }
//
// interface MaterialPlan {
//     id: number;
//     name: string;
//     description: string;
//     // другие поля, которые могут быть в плане материала
// }
//
// interface Course {
//     id: number;
//     direction_id: number;
//     name: string;
//     short_name: string;
//     description: string;
//     code: string | null;
//     status: number | null;
//     created_at: number;
//     updated_at: number;
//     video: string | null;
//     require_abstract: number;
//     sorting: number;
//     // другие поля, которые могут быть в курсе
// }
//
// interface Order {
//     id: number;
//     direction_id: number;
//     children_id: number;
//     tariff_id: number;
//     learning_class: number | null;
//     teacher_id: number | null;
//     group_id: number;
//     buy_months: number;
//     buy_hours: number | null;
//     status_payment: number;
//     comment: string | null;
//     distribution: number;
//     payment_amount: string;
//     next_payment_date: string;
//     created_at: number;
//     updated_at: number;
//     countParentReports: number;
//     data_filled: number;
//     send_to_bot: number;
//     parent_touch: number;
//     is_disabled: number;
//     auto_renewal: boolean;
//     class_id: number | null;
//     tariff: Tariff
// }
//
// interface Tariff {
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
//     attached_groups: string | null;
//     isAttached_groups: number;
//     visibility_courses: number;
//     any_seminarian: boolean,
//     currency: string;
//     has_paid_cancel: number;
//     paid_cancel_student: number;
//     paid_cancel_teacher: number;
//
// }
//
// export interface CoursePlan {
//     children_id: number;
//     course: Course;
//     group_id: number;
//     order: Order;
//     status: number,
//     type: string,
//     materials: LessonMaterial[];
//     themesCount: number,
//     themesFinished: number
//
//  //   tariff: Tariff;
//     // другие поля, которые могут быть в плане курса
// }
//
// interface Teacher {
//     id: number;
//     name: string;
//     email: string;
//     phone: string;
//     avatar_path: string;
//     pulses: number;
//     balance: number;
//     balance_euro: number;
//     balance_dollar: number;
//     position_rating: number | null;
//     status: number;
//     // другие поля, которые могут быть у учителя
// }
//
// interface Direction {
//     id: number;
//     name: string;
//     short_name: string;
//     description: string;
//     icon_path: string;
//     created_at: number;
//     updated_at: number;
//     code: string | null;
//     start_price: string;
//     use_promo_code: number;
//     use_discount: number;
//     filter_id: number;
//     seminarian_id: number;
//     permission_add_child: number;
//     view: number;
//     old_price: string;
//     sorting: number;
//     flag_easily_creating: number;
//     // другие поля, которые могут быть в направлении
// }
//
// interface Group {
//     id: number;
//     name: string;
//     any_seminarian: number;
//     coursePlans: CoursePlan[];
//     direction: Direction;
//     direction_id: number,
//     teacher: Teacher;
//     teacher_id: number,
//     lessonPlans: {
//         lesson: Lesson;
//     }[];
//     materialPlans: MaterialPlan[];
//
//     // другие поля, которые могут быть в группе
// }
//
// interface Children {
//     id: number;
//     custom_id: string | null;
//     email: string;
//     phone: string;
//     name: string;
//     avatar_path: string;
//     promo_code: string;
//     created_at: number;
//     updated_at: number;
//     reportParents: {
//         id: number;
//         direction_id: number;
//         children_id: number;
//         seminarian_id: number;
//         message: string | null;
//         transferred: number;
//         created_at: number;
//         updated_at: number;
//         order_id: number;
//         is_filled: number;
//         quantity_reports: number;
//     }[];
//     pulses: number;
//     balance: number;
//     balance_euro: number;
//     balance_dollar: number;
//     position_rating: number | null;
//     status: number;
//     // другие поля, которые могут быть у ребенка
// }
//
// interface DirectionPlanData {
//    // children: Children;
//    // group: Group;
//     group_id: number,
//     paid_up_to: null | any,
//     status: string
// }


// const initialState: DirectionPlanState = {
//     data: null,
//     status: 'idle',
//     error: null,
// };


//// НОВОЕ     ПРОВЕРИТЬ что выше. поудалять ненужное /////////////

interface Theme {
    id: string;
}

export interface DirectionItem {
    id: string;
    name: string;
    totalCount: number;
    finishedCount: number;
    isActive: number; // или boolean, если 1/0 преобразуется в true/false
    sorting: number;
    themes: Theme[];
}

interface ResponseData {
    data: DirectionItem[];
    course_name: string;
    flag_one_block: number;
}

export interface ApiResponseDirectionPlan {
    status: "success" | "error"; // предполагая, что возможны другие статусы
    data: ResponseData;
}

// Интерфейс для параметров запроса
interface FetchDirectionPlanParams {
    groupId?: number | null;
    course_id?: number | null;
}

interface DirectionPlanState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    data: ResponseData | null; // data должен быть ResponseData, а не ApiResponse
    error: string | null;
}

const initialState: DirectionPlanState = {
    status: 'idle',
    data: null,
    error: null,
};

export const fetchDirectionPlan = createAsyncThunk(
    'directionPlan/fetchDirectionPlan',
    async ({groupId, course_id}: FetchDirectionPlanParams) => {
        try {
            const params = groupId
                ? {group_id: groupId, type: 'group'}
                : {course_id, type: 'private'};

            const response = await axiosInstance.get<ApiResponseDirectionPlan>(
                '/v1/direction-plan-beta/get-course-blocks/',
                {params}
            );

            return response.data;
        } catch (error) {
            throw new Error('Error fetching direction plan data');
        }
    }
);

export const fetchDirectionPlanBySeminarian = createAsyncThunk(
    'directionPlan/fetchDirectionPlanBySeminarian',
    async (course_id: number) => {
        try {
            const response = await axiosInstance.get<ApiResponseDirectionPlan>(
                '/v1/direction-plan-beta/get-course-blocks/',
                {params: {course_id}}
            );

            return response.data;
        } catch (error) {
            throw new Error('Error fetching direction plan data');
        }
    }
);


const directionPlanSlice = createSlice({
    name: 'directionPlan',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDirectionPlan.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchDirectionPlan.fulfilled, (state, action: PayloadAction<ApiResponseDirectionPlan>) => {
                state.status = 'succeeded';
                state.data = action.payload.data; // Используем action.payload.data, а не весь ApiResponse
                state.error = null;
            })
            .addCase(fetchDirectionPlan.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Something went wrong';
            })
            .addCase(fetchDirectionPlanBySeminarian.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchDirectionPlanBySeminarian.fulfilled, (state, action: PayloadAction<ApiResponseDirectionPlan>) => {
                state.status = 'succeeded';
                state.data = action.payload.data; // Используем action.payload.data, а не весь ApiResponse
                state.error = null;
            })
            .addCase(fetchDirectionPlanBySeminarian.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Something went wrong';
            });
    },
});

export default directionPlanSlice.reducer;