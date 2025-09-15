// types.ts

import axiosInstance from "../../services/axios/axiosConfig.ts";

export type ReportParent = {
    id: number;
    direction_id: number;
    children_id: number;
    seminarian_id: number;
    message: string | null;
    transferred: number;
    created_at: number;
    updated_at: number;
    order_id: number;
    is_filled: number;
    quantity_reports: number;
};

interface Child {
    id: number;
    custom_id: string | null;
    email: string;
    phone: string;
    name: string;
    avatar_path: string;
    promo_code: string;
    created_at: number;
    updated_at: number;
    reportParents: any[]; // Если есть структура, лучше уточнить тип
}

export type LessonTasksType = {
    id: number;
    sorting: number;
    task: Task;
}

interface Lesson {
    auto_verification: number;
    description: string;
    blocks: Block[];
    estimated_at: number | null;
    lessonFileMedia?: LessonFileMedia;
    id: number;
    ignoring_homework_status: number;
    lessonMaterials: any[]; // Уточните тип, если известно
    lessonTasks: LessonTasksType[]; // Уточните тип
    lessonVideos: any[]; // Уточните тип
    lesson_file: string | null;
    link_to_crib: string;
    name: string,
    redo_homework: number,
    required_abstract: number,
    scorm_archive_file: null | any,
    scorm_index_file: null | any,
    show_abstract: number,
    success: null | any,
    topic_id: number,
    videos: null | any,
    plan_id: number,
    abstract: null | any


}

// export type HomeWorkResult = {
//     attempt: number;
//     id: number;
//     children_id: number;
//     work_id: number;
//     task_id: number;
//     verified_by_id: number;
//     answer: string;
//     answer_type: string;
//     decided_right: number;
//     created_at: number;
//     updated_at: number;
//     comment: string | null;
//     score: number;
//     prompt: string; // JSON string
//     video_solution: string | null;
//     correct_answer: string; // JSON string
//     comment_files: string | null;
//     answer_files: string | null;
// };

interface AnswerFile {
    extension: string;   // расширение файла (например, pdf)
    name: string;        // имя файла
    path: string;        // путь к файлу
    size: number;        // размер файла
    type: string;        // тип файла (например, application/pdf)
}

export type Basket = {
    id: string;
    name: string;
};

export interface Task {
    answer_options: string[]; // Пустой массив, может быть более специфичная типизация
    complexity: number | null;
    baskets: Basket[] | null;
    correct_answer: string | null;
    created_at: number;
    direction_id: number;
    exam_weight: string;
    is_timed_task: number | null;
    homeTaskFiles: FileData[]; // Предполагаем, что массив файлов пустой
    id: number;
    key_text: string; // Это JSON строка, но для удобства работы можно использовать как объект
    numberExam: string[]; // Пустой массив
    number_exam_id: number | null;
    option_all_mismatch: string | null;
    option_all_mismatch_order: string | null;
    option_all_number_right: string | null;
    option_not_all_mismatch: string | null;
    option_one_mismatch_order: string | null;
    option_order_matters: string | null;
    prompt: string | null;
    question: string; // Это тоже JSON строка, преобразованная в объект
    question_file: string | null;
    subtopic_id: number | null;
    topic_id: number | null;
    type: string;
    updated_at: number;
    video_solution: string | null;
}

// Интерфейс для описания ответа на задание
export interface HomeWorkResults {
    answer: string;                     // ответ (может быть текстом, файлом и т.д.)
    answer_files: AnswerFile[];         // массив файлов ответа
    answer_type: string;                // тип ответа (например, text)
    attempt: number;                    // количество попыток
    children_id: number;                // идентификатор ребенка (учащегося)
    comment: string | null;             // комментарий (может отсутствовать)
    comment_files: AnswerFile[] | null; // файлы с комментариями (если есть)
    correct_answer: string | null;      // правильный ответ, если есть
    created_at: number;                 // время создания ответа (timestamp)
    decided_right: number;              // флаг верного решения (1 — верно, 0 — неверно)
    id: number;                         // идентификатор ответа
    prompt: string | null;              // подсказка (если есть)
    score: number;                      // оценка (например, от 0 до 1)
    task_id: number;                    // идентификатор задания
    updated_at: number;                 // время последнего обновления (timestamp)
    verified_by_id: number | null;      // идентификатор проверяющего (если есть)
    video_solution: string | null;      // ссылка на видеорешение (если есть)
    work_id: number;                    // идентификатор работы
    time_spent:  number | null;
}

export type HomeWork = {
    pulses: number;
    balance: number;
    balance_euro: number;
    balance_dollar: number;
    position_rating: number | null;
    attempt: number;
    can_redo: boolean;
    children: Child;
    children_id: number;
    comment: string | null;
    completed_date: string | null;
    course_id: number;
    deadline_date: string;
    decided_right: boolean | null;
    direction_id: number;
    expired_date: string | null;
    group_id: number;
    homeWorkResults: HomeWorkResults[]; // Уточните тип
    homeWorkUniqueTasks: any[]; // Уточните тип
    id: number;
    is_unique: number | null;
    lesson: Lesson;
    lesson_id: number;
    mark: number | null;
    min_points_scored: boolean;
    number_work: boolean;
    only_content: number;
    private_work_id: number | null;
    score: number;
    status: number;
    type: string;
    verified_by_id: number | null;
    verified_date: string | null;
    view: number;

};

// homeWorkSlice.ts

import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Block, LessonFileMedia} from "./lessonSlice.ts";
import {FileData} from "./probeWorkSlice.ts";


interface HomeWorkState {
    homeWork: HomeWork | null;
    loading: boolean;
    error: string | null;
}

const initialState: HomeWorkState = {
    homeWork: null,
    loading: false,
    error: null,
};

const homeWorkSlice = createSlice({
    name: 'homeWork',
    initialState,
    reducers: {
        fetchHomeWorkRequest(state) {
            state.loading = true;
            state.error = null;
        },
        fetchHomeWorkSuccess(state, action: PayloadAction<HomeWork>) {
            state.homeWork = action.payload;
            state.loading = false;
        },
        fetchHomeWorkFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        clearHomeWork(state) {
            state.homeWork = null;
        },
    },
});

export const fetchHomeWork = createAsyncThunk(
    'homeWork/fetchHomeWork',
    async (homeWorkId: number, {dispatch}) => {
        dispatch(fetchHomeWorkRequest());
        try {
            const response = await axiosInstance.get<HomeWork>(`/v1/home-work/view/${homeWorkId}?expand=expand=lesson.lessonVideos,lesson.lessonMaterials,lesson.lessonTasks.task,lesson.lessonTasks.mime,lesson.lessonTasks.task.homeTaskFiles,lesson.lessonTasks.task.numberExam,lesson.lessonTasks.task.mime,homeWorkResults,homeWorkUniqueTasks.task,homeWorkUniqueTasks.task.numberExam,homeWorkUniqueTasks.task.homeTaskFiles,lesson.blocks&pageSize=false&id=${homeWorkId}`);
            dispatch(fetchHomeWorkSuccess(response.data));
        } catch (error) {
            // @ts-ignore
            dispatch(fetchHomeWorkFailure(error?.message));
        }
    }
);

export const {
    fetchHomeWorkRequest,
    fetchHomeWorkSuccess,
    fetchHomeWorkFailure,
    clearHomeWork,
} = homeWorkSlice.actions;

export default homeWorkSlice.reducer;
