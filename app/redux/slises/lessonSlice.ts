import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {createAsyncThunk} from '@reduxjs/toolkit';
import axiosInstance from "../../services/axios/axiosConfig.ts";
import {Type} from "./studentCoursesSlice.ts";
import {LessonTask} from "./homeworkSlice.ts";

interface LessonState {
    status: string;
    error: string | null;
    data: Lesson | null;
}

export type CourseVisibility = 1 | 2 | 3;
export type LessonVideo = {
    file: string
    id: string
    lesson_id: string
    link: string
    media: any
    media_id: any
    name: string
    storage_type: string
}
export type BlockType = 'title' | 'text' | 'videos' | 'materials' | 'scorm' | 'pdf' | 'image' | 'iframe';

export type ImageType = {
    href: string
    id: number
    name: string
    path: string
}

export interface Block {
    id: string;
    lesson_id: string;
    type: BlockType;
    text: string | null;
    align?: string | null;
    size?: string | null;
    order: string;
    // Другие поля по необходимости
    lessonVideos?: any[];
    lessonImages?: ImageType[] | ImageType;
    lessonMaterials?: any[];
    lessonFileMedia?: LessonFileMedia;
    scormFileMedia?: any[];
}

export interface Lesson {
    id: number;
    blocks: Block[];
    survey_id: number;
    survey_required: number;
    topic_id: number;
    name: string;
    lessonTasks: LessonTask[];
    description: string;
    videos: LessonVideo[];
    required_abstract: number;
    link_to_crib: string | null;
    link_to_script: string | null;
    estimated_at: number;
    show_abstract: number;
    lesson_file: null | LessonFileMedia;
    redo_homework: number;
    success: null | any; // Уточните тип, если известен
    scorm_index_file: null | string;
    scorm_archive_file: null | string;
    auto_verification: number;
    ignoring_homework_status: number;
    under_inspection_text: string;
    completed_text: string;
    success_text_liner: string;
    unsuccessfully_text_liner: string;
    not_passed_text: string;
    sorting: number;
    scorm_media_id: number;
    iframe: string;
    media_id: number | null;
    lesson_block_order: string[];
    theme_id: number;
    material_id: number | null;
    type: string;
    text_block_content: string;
    text_block_alignment: string;
    scorm_width: string;
    scorm_height: string;
    lessonMaterials: any[]; // Уточните тип
    topic: Topic;
    lessonVideos: any[]; // Уточните тип
    lessonPdfMediaRelation: LessonPdfMediaRelation;
    lessonFileMedia: LessonFileMedia;
    lessonScormMedia: any | null; // Уточните тип
    scormFileMedia: any | null; // Уточните тип
    media: any[]; // Уточните тип
    homeWorks: any[]; // Уточните тип
    lessonTasksCount: number;
    lessonSurvey: LessonSurvey | null; // Уточните тип
    homeWork: HomeWork;
    directionId: number;
    courseVisibility: CourseVisibility;
    next_lesson: NextLesson;
    prev_lesson: null | NextLesson;
    first_in_theme: number;
    first_in_block: number;
    first_in_course: number;
    last_in_theme: number;
    last_in_block: number;
    last_in_course: number;
    plan_id: number;
    abstract: null | any; // Уточните тип
}

interface Topic {
    id: string;
    name: string;
    type: string;
    description: string;
    videos: null | any; // Уточните тип
    required_abstract: string;
    link_to_crib: string | null;
    link_to_script: string | null;
    sorting: string;
    course_id: string;
    estimated_at: null | number;
    gallery: null | any; // Уточните тип
    probe_file: null | any; // Уточните тип
    lesson_id: null | number;
}

interface LessonPdfMediaRelation {
    id: string;
    t_lesson_pdf_id: string;
    media_id: string;
    name: string;
    link: string;
    file: string;
    storage_type: string;
}

export interface LessonFileMedia {
    id: string;
    user_id: string;
    name: string;
    path: string;
    type: string;
    is_approved: string;
    created_at: string;
    updated_at: string;
    source_name: string;
    extension: string;
    type_file: string;
    size: string;
    scorm_index_file: string;
}

interface ScheduleItem {
    day: number;
    label: string;
    active: boolean;
    hour: number;
    minutes: number;
}

export interface LessonSurvey {
    id: string;
    title: string;
    description: string;
    available_for_classes: null;
    available_for_directions: null;
    available_for_extra_users: null;
    available_for_roles: null;
    available_for_teams: null;
    available_for_units: null;
    backLink: string | null;
    created_at: string;
    followingLink: string | null;
    isAnonymousAllowed: string;
    is_deleted: string;
    is_survey_passed: boolean;
    link: string | null;
    order: string | null;
    repeat: string;
    schedule: ScheduleItem[];
    type: string;
    updated_at: string;
    user_id: string;
}


interface HomeWork {
    id: string;
    children_id: string;
    verified_by_id: string;
    private_work_id: null | string;
    score: string;
    decided_right: string;
    status: number;
    type: string;
    view: string;
    expired_date: string;
    completed_date: string;
    direction_id: string;
    course_id: string;
    lesson_id: string;
    group_id: string;

    verified_date: string;
    deadline_date: string;
    comment: string;
    is_unique: string;
    mark: string;
    attempt: string;
    only_content: string;
    is_classwork: string;
    created_at: string;
    created_by: string;
    send_at: null | string;
    teacher_id: string;
    min_points_scored: boolean;
}

interface NextLesson {
    lessonId: number;
    themeId: number;
    blockId: number;
}


const initialState: LessonState = {
    status: "idle",
    error: null,
    data: null,
};

const lessonSlice = createSlice({
    name: 'lesson',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLessonData.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchLessonData.fulfilled, (state, action: PayloadAction<{ data: { data: Lesson } }>) => {
                state.status = "succeeded";
                state.data = action.payload.data.data; // Убираем еще один уровень вложенности
            })
            .addCase(fetchLessonData.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "Something went wrong";
            });
    },
});


export const fetchLessonData = createAsyncThunk(
    'lesson/fetchLessonData',
    async ({groupId, lessonId, type}: { groupId?: number; lessonId: number, type?: Type }) => {
        let params;
        if (type === 'private') {
            params = {
                lessonId,
                type,
                courseId: `${groupId}-private`,
            }
        } else {
            params = {
                lessonId,
                type,
                groupId: groupId,

            }
        }
        const response = await axiosInstance.get(`/v1/direction-plan-beta/view-lesson`, {
            params: params,
        });
        return response.data;
    }
);



export default lessonSlice.reducer;
