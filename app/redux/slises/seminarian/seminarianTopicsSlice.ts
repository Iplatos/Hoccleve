import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

import axios from 'axios';
import {RootState} from "../../store/store.ts";
import axiosInstance from "../../../services/axios/axiosConfig.ts";

// Типы данных

export interface TopicLesson {
    id: number;
    name: string;
    topicLesson: {
        auto_verification: number;
        completed_text: string | null;
        description: string;
        estimated_at: number;
        id: number;
        iframe: string | null;
        ignoring_homework_status: number;
        lesson_block_order: any[]; // если позже понадобится, уточни структуру
        lesson_file: string | null;
        link_to_crib: string | null;
        link_to_script: string | null;
        material_id: number | null;
        media_id: number | null;
        name: string;
        not_passed_text: string | null;
        redo_homework: number;
        required_abstract: number;
    }[]
    // добавьте поля, если в material есть topicLesson, сейчас material: []
}

export interface DirectionCourse {
    id: number;
    direction_id: number;
    name: string;
    short_name: string;
    code: string | null;
    status: string | null;
    created_at: number;
    updated_at: number;
    video: string | null;
    require_abstract: number;
    description: string;
    sorting: number;
    view: number;
    material: TopicLesson[];
}

export interface SeminarianTopicState {
    id: number;
    name: string;
    short_name: string;
    description: string;
    icon_path: string;
    created_at: number;
    updated_at: number;
    code: string | null;
    start_price: string;
    use_promo_code: number;
    use_discount: number;
    filter_id: number;
    seminarian_id: number | null;
    permission_add_child: number;
    view: number;
    old_price: string;
    sorting: number | null;
    flag_easily_creating: number;
    flag_one_block: number;
    icon_media_id: number | null;
    sub_folder_id: number | null;
    flag_allow_certificate: number;
    certificate_unlock_percentage: number;
    has_demo: number;
    duration_in_months: number;
    media_icon_id: number | null;
    certificate_template_id: number;
    directionCourses: DirectionCourse[];
}

//
export interface DirectionCourseItem {
    id: number;
    direction_id: number;
    name: string;
    short_name: string;
    code: string | null;
    status: string | null;
    created_at: number;
    updated_at: number;
    video: string | null;
    require_abstract: number;
    description: string;
    sorting: number;
    view: number;
}

export interface Link {
    href: string;
}

export interface Links {
    self: Link;
    first: Link;
    last: Link;
}

export interface Meta {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
}

export interface DirectionCourseResponse {
    data: DirectionCourseItem[];
    _links: Links;
    _meta: Meta;
}

//
export interface TopicLesson2 {
    id: string;
    name: string;
    type: string;
    material_id: number | null;
}
export interface BlockThemeSeminarian {
    id: number;
    name: string;
    description: string;
    type: string;
    sorting: number;
    topicLesson: TopicLesson2[];
    estimated_at: number | null;
    course_id: number;
}
export interface BlockThemeData {
    data: BlockThemeSeminarian[];
    block_name: string;
}
export interface SeminarianTopicsResponse {
    status: string;
    data: BlockThemeData;
}

export type SelectTopicRequest   = {
    comment_to_dz: string,
    date: string,
    lesson_topic: string,
    type: "changeTopic"
}

//
export type RescheduleRequest = {
    audience_number?: string;
    date: string;
    direction_course_id?: string;
    interval_type: 'one-time' | string;
    is_choose_material?: boolean;
    is_offline?: boolean;
    lesson_type?: string;
    material_comment?: string;
    material_id?: number;
    topic_lesson_id?: number | null;
    type: 'changeMaterial' | string;
};
type RescheduleResponse = {
    status: string;
    message?: string;
    data?: any;
};

// Состояние

interface SeminarianTopicsSliceState {
    data: SeminarianTopicState | null;
    seminarianCourse: DirectionCourseResponse | null;
    seminarianTheme: SeminarianTopicsResponse | null;
    rescheduleRequest: RescheduleResponse | null;
    loading: boolean;
    error: string | null;
    isLoadingRescheduleLesson: boolean;
}


// Начальное состояние

const initialState: SeminarianTopicsSliceState = {
    data: null,
    seminarianCourse: null,
    seminarianTheme: null,
    rescheduleRequest: null,
    loading: false,
    isLoadingRescheduleLesson: false,
    error: null,
};


export const fetchSeminarianTopics = createAsyncThunk<
    SeminarianTopicState,
    number,
    { rejectValue: string }
>(
    'seminarianTopics/fetch',
    async (id, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(
                `/v1/direction/view/${id}?expand=directionCourses.material.topicLesson`
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка загрузки тем');
        }
    }
);


export const fetchSeminarianCourse = createAsyncThunk<
    DirectionCourseResponse,
    number,
    { rejectValue: string }
>(
    'seminarianCourse/fetch',
    async (id, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(
                `/v1/direction-course/?filter[direction_id][eq]=${id}`
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка загрузки тем');
        }
    }
);

export const fetchSeminarianTheme = createAsyncThunk<
    SeminarianTopicsResponse,
    {
        blockId: string;
        type: string;
    },
    { rejectValue: string }
>(
    'seminarianTheme/fetch',
    async ({blockId, type}, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(
                `/v1/direction-plan-beta/get-block-themes/?blockId=${blockId}&type=${type}`
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Ошибка загрузки тем');
        }
    }
);

export const rescheduleLesson = createAsyncThunk<
    RescheduleResponse,
    { id: number; payload: RescheduleRequest },
    { rejectValue: string }
>(
    'timetable/rescheduleLesson',
    async ({id, payload}, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.post(`/v1/timetable/reschedule?id=${id}`, payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при переносе занятия');
        }
    }
);
export const changeTopic = createAsyncThunk<
    RescheduleResponse,
    { id: number; payload: SelectTopicRequest },
    { rejectValue: string }
>(
    'timetable/changeTopic',
    async ({id, payload}, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.post(`/v1/timetable/select-topic?id=${id}`, payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при переносе занятия');
        }
    }
);




const seminarianTopicsSlice = createSlice({
    name: 'seminarianTopics',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSeminarianTopics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSeminarianTopics.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchSeminarianTopics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Неизвестная ошибка';
            })
            .addCase(fetchSeminarianCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSeminarianCourse.fulfilled, (state, action) => {
                state.loading = false;
                state.seminarianCourse = action.payload;
            })
            .addCase(fetchSeminarianCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Неизвестная ошибка';
            })
            .addCase(fetchSeminarianTheme.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSeminarianTheme.fulfilled, (state, action) => {
                state.loading = false;
                state.seminarianTheme = action.payload;
            })
            .addCase(fetchSeminarianTheme.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Неизвестная ошибка';
            })
            .addCase(rescheduleLesson.pending, (state) => {
                state.isLoadingRescheduleLesson = true;
                state.error = null;
            })
            .addCase(rescheduleLesson.fulfilled, (state, action) => {
                state.isLoadingRescheduleLesson = false;
                state.rescheduleRequest = action.payload;
            })
            .addCase(rescheduleLesson.rejected, (state, action) => {
                state.isLoadingRescheduleLesson = false;
                state.error = action.payload || 'Неизвестная ошибка';
            })
            .addCase(changeTopic.pending, (state) => {
            state.isLoadingRescheduleLesson = true;
            state.error = null;
        })
            .addCase(changeTopic.fulfilled, (state, action) => {
                state.isLoadingRescheduleLesson = false;
                state.rescheduleRequest = action.payload;
            })
            .addCase(changeTopic.rejected, (state, action) => {
                state.isLoadingRescheduleLesson = false;
                state.error = action.payload || 'Неизвестная ошибка';
            })
    },
});

export default seminarianTopicsSlice.reducer;
