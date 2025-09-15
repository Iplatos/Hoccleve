import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios/axiosConfig.ts";

export interface TopicType {
    id: number;
    name: string;
    type: string;
    description: string;
    probe_file: string | null;
    sorting: number;
    course_id: number;
    estimated_at: number | null;
}

export interface LessonTaskType {
    id: number;
    sorting: number | null;
    task: any; // можешь уточнить, если знаешь структуру task
}

export interface LessonType {
    id: number;
    name: string;
    description: string;
    auto_verification: number;
    completed_text: string;
    estimated_at: number;
    iframe: string;
    ignoring_homework_status: number;
    lessonTasks: LessonTaskType[];
    lesson_block_order: string[];
    lesson_file: string | null;
    link_to_crib: string;
    link_to_script: string;
    material_id: number | null;
    media_id: number | null;
    not_passed_text: string;
    redo_homework: number;
    required_abstract: number;
    scorm_archive_file: string | null;
    scorm_height: number;
    scorm_index_file: string | null;
    scorm_media_id: string | null;
    scorm_width: number;
    show_abstract: number;
    sorting: number;
    success: boolean | null;
    success_text_liner: string;
    survey_id: number | null;
    survey_required: number;
    text_block_alignment: string;
    text_block_content: string;
    theme_id: number;
    topic: TopicType;
    topic_id: number;
    under_inspection_text: string;
    unsuccessfully_text_liner: string;
    videos: any; // можешь уточнить тип видео, если есть структура
}

export interface DirectionType {
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
    // добавь другие поля при необходимости
}

export interface HomeWorkType {
    attempt: number;
    can_redo: boolean;
    children_id: number;
    comment: string | null;
    completed_date: string | null;
    course_id: number;
    created_at: string;
    created_by: number;
    deadline_date: string;
    decided_right: any; // если известен тип — уточни
    direction: DirectionType;
    direction_id: number;
    expired_date: string | null;
    group_id: number;
    homeWorkResults: any[]; // если есть структура результата — уточни
    homeWorkUniqueTasks: any[]; // аналогично
    id: number;
    is_classwork: number;
    is_unique: number;
    lesson: LessonType;
    lesson_id: number;
    mark: number | null;
    min_points_scored: boolean;
    number_work: string | null;
    only_content: number;
    private_work_id: number | null;
    score: number;
    send_at: string | null;
    status: number;
    teacher_id: number;
    type: string;
    verified_by_id: number | null;
    verified_date: string | null;
    view: number;


    work?: {
        course?: {
            direction?: {
                name?: string;
            };
        };
        material?: any;
    };


    controlWorkResults?: any;
}

export type WorkType = 'homework' | 'controlwork' | 'classwork';

interface WorkState {
    [workType: string]: {
        works: HomeWorkType[];
        status: 'idle' | 'loading' | 'succeeded' | 'failed';
        error: string | null;
        meta: {
            currentPage: number;
            pageCount: number;
            perPage: number;
            totalCount: number;
        } | null;
        currentFilter: number | null;
    };
}

const initialState: WorkState = {
    homework: {
        works: [],
        status: 'idle',
        error: null,
        meta: null,
        currentFilter: null
    },
    controlwork: {
        works: [],
        status: 'idle',
        error: null,
        meta: null,
        currentFilter: null
    },
    classwork: {
        works: [],
        status: 'idle',
        error: null,
        meta: null,
        currentFilter: null
    }
};


export const fetchWorks = createAsyncThunk(
    'works/fetchWorks',
    async ({
               workType,
               id,
               page,
               statusFilter
           }: { workType: WorkType, id: number, page: number, statusFilter: number }) => {
        let endpoint = '/v1/home-work';
        let additionalParams = {};

        // Определяем URL и дополнительные параметры в зависимости от типа работы
        switch (workType) {
            case 'controlwork':
                endpoint = '/v1/control-work';
                additionalParams = {
                    'filter[status][eq]': statusFilter === 0 ? 2 : statusFilter,
                    'filter[children_id][eq]': id,
                    'expand': 'work,work.material.course,work.material.course.direction,work.material.controlTasks,work.material.controlTasks.task,controlWorkResults'

                };
                break;
            case 'classwork':
                endpoint = '/v1/home-work';
                additionalParams = {
                    'filter[status][eq]': statusFilter,
                    'filter[is_classwork][eq]': '1',
                    'expand': 'lesson.lessonTasks,lesson.topic,direction,homeWorkResults,lesson.lessonTasks.task,homeWorkUniqueTasks.task',
                    'id': id
                };
                break;
            default:
                additionalParams = {
                    'filter[status][eq]': statusFilter,
                    'filter[is_classwork][eq]': '0',
                    'expand': 'lesson.lessonTasks,lesson.topic,direction,homeWorkResults,lesson.lessonTasks.task,homeWorkUniqueTasks.task',
                    'id': id
                };
                break;
        }

        const response = await axiosInstance.get(endpoint, {
            params: {
                ...additionalParams,
                page
            }
        });

        return { data: response.data, workType };
    }
);


const workSlice = createSlice({
    name: 'works',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorks.pending, (state, action) => {
                const workType = action.meta.arg.workType;
                state[workType].status = 'loading';
            })
            .addCase(fetchWorks.fulfilled, (state, action) => {
                const { data, workType } = action.payload;
                const { _meta, data: works } = data;
                const { page, statusFilter } = action.meta.arg;

                state[workType].status = 'succeeded';

                // Проверяем, изменился ли фильтр
                if (statusFilter !== state[workType].currentFilter || page === 1) {
                    state[workType].works = works;
                } else {
                    const dataMap = new Map(state[workType].works.map(item => [item.id, item]));
                    works.forEach((item: any) => dataMap.set(item.id, item));
                    state[workType].works = Array.from(dataMap.values());
                }

                state[workType].currentFilter = statusFilter;
                state[workType].meta = _meta;
            })
            .addCase(fetchWorks.rejected, (state, action) => {
                const workType = action.meta.arg.workType;
                state[workType].status = 'failed';
                state[workType].error = action.error.message || 'Something went wrong';
            });
    }
});

export default workSlice.reducer;
