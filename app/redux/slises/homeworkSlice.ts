import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from "../../services/axios/axiosConfig.ts";
import {FileData} from "./probeWorkSlice.ts";
import {Basket} from "./homeWorkDetailSlice.ts";

export type TextNode = {
    type: 'text';
    text: string;
};

export type ParagraphNode = {
    type: 'paragraph';
    content: TextNode[];
};

export type MathNode = {
    type: 'math';
    attrs: { value: string };
};

export type AnswerText = {
    type: 'doc';
    content: (ParagraphNode | MathNode)[];
};

interface Direction {
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
}
export type MatchItem = {
    id: number;
    img: string;
    text: string; // JSON-строка, которую нужно парсить в DocText
};

export interface Task {
    id: number;
    number_exam_id: number | null;
    baskets: string;
    topic_id: number | null;
    subtopic_id: number | null;
    question: string;
    type: string;

    answer_options: string | {
        answer: number;
        index: number;
        question: string;
        type: string;
        text: AnswerText;
        left: MatchItem[];
        right: MatchItem[];
    }[];
    correct_answer?: string;
    complexity: number;
    key_text: string;
    exam_weight: { score: number, description: string }[];
    option_all_number_right: number | null;
    option_all_mismatch: number | null;
    option_not_all_mismatch: number | null;
    created_at: number;
    updated_at: number;
    homeTaskFiles: FileData[];
    question_file: string | null;
    option_order_matters: number | null;
    option_all_mismatch_order: number | null;
    option_one_mismatch_order: number | null;
    direction_id: number;
}

export interface LessonTask {
    id: number;
    sorting: number;
    task: Task;
}

interface Topic {
    id: number;
    name: string;
    type: string;
    description: string;
    probe_file: string | null;
    sorting: number;
    course_id: number;
    estimated_at: number | null;
}

interface Lesson {
    id: number;
    topic_id: number;
    name: string;
    description: string;
    videos: string | null;
    required_abstract: number;
    link_to_crib: string;
    link_to_script: string;
    estimated_at: number;
    show_abstract: number;
    lesson_file: string | null;
    redo_homework: number;
    success: number | null;
    scorm_index_file: string | null;
    scorm_archive_file: string | null;
    auto_verification: number;
    ignoring_homework_status: number;
    under_inspection_text: string;
    completed_text: string;
    success_text_liner: string;
    unsuccessfully_text_liner: string;
    not_passed_text: string;
    topic: Topic;
    lessonTasks: LessonTask[];
}

interface Homework {
    id: number;
    children_id: number;
    verified_by_id: number | null;
    private_work_id: number | null;
    score: number;
    decided_right: number | null;
    status: number;
    type: string;
    view: number;
    expired_date: string | null;
    completed_date: string | null;
    direction_id: number;
    course_id: number;
    lesson_id: number;
    group_id: number;
    verified_date: string | null;
    deadline_date: string;
    comment: string | null;
    is_unique: number;
    mark: number | null;
    attempt: number;
    only_content: number;
    number_work: string | null;
    min_points_scored: boolean;
    can_redo: boolean;
    direction: Direction;
    lesson: Lesson;
}

interface HomeworkState {
    homeworks: Homework[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    meta: {
        currentPage: number;
        pageCount: number;
        perPage: number;
        totalCount: number;
    } | null;

}

const initialState: HomeworkState = {
    homeworks: [],
    status: 'idle',
    error: null,
    meta: null,

};

export const fetchHomework = createAsyncThunk(
    'homework/fetchHomework',
    async ({id, page, statusFilter}: { id: number, page: number, statusFilter: number }) => {
        const response = await axiosInstance.get(`/v1/home-work`, {
            params: {
                //  'filter[status][in][]': [0, 1, 2], // Фильтры по статусам (если нужно)
                'filter[status][eq]': statusFilter, // Добавляем новый параметр фильтрации
                'expand': 'lesson.lessonTasks,lesson.topic,direction,homeWorkResults,lesson.lessonTasks.task,homeWorkUniqueTasks.task',
                'id': id,
                'page': page
            }
        });
        return response.data;
    }
);

const homeworkSlice = createSlice({
    name: 'homework',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHomework.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchHomework.fulfilled, (state, action) => {
                const {_meta, data} = action.payload;
                const {page, statusFilter} = action.meta.arg;

                // Установите статус на 'succeeded'
                state.status = 'succeeded';

                // Проверьте, изменился ли фильтр
                if (statusFilter !== state.currentFilter || page === 1) {
                    // Если фильтр изменился или это первая страница, полностью заменяем данные
                    state.homeworks = data;
                } else {
                    // Иначе добавляем новые данные
                    const dataMap = new Map(state.homeworks.map(item => [item.id, item]));
                    data.forEach(item => dataMap.set(item.id, item));
                    state.homeworks = Array.from(dataMap.values());
                }


                // Обновите текущий фильтр и метаинформацию

                state.currentFilter = statusFilter;
                state.meta = _meta;
            })
            .addCase(fetchHomework.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Something went wrong';
            });
    }
});

export default homeworkSlice.reducer;
