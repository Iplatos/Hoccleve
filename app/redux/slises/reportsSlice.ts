import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import axiosInstance from "../../services/axios/axiosConfig.ts";

interface Direction {
    id: number;
    name: string;
    short_name: string;
    description: string;
    icon_path: string;
}
interface TopicDescription {
    type: string;
    content: Array<{
        type: string;
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
}
interface Topic {
    id: number;
    name: string;
    type: string;
    description: TopicDescription;
    probe_file: string | null;
    sorting: number;
    course_id: number;
    estimated_at: number | null;
}
interface Video {
    link: string;
    name: string;
}
interface LessonDescription {
    type: string;
    content: Array<{
        type: string;
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
}
interface Lesson {
    id: number;
    topic_id: number;
    name: string;
    description: LessonDescription;
    videos: Video[];
    required_abstract: number;
    link_to_crib: string | null;
    link_to_script: string | null;
    estimated_at: number;
    show_abstract: number;
    lesson_file: string | null;
    redo_homework: number;
    success: string | null;
    scorm_index_file: string | null;
    scorm_archive_file: string | null;
    auto_verification: number;
    ignoring_homework_status: number;
    under_inspection_text: string | null;
    completed_text: string | null;
    success_text_liner: string | null;
    unsuccessfully_text_liner: string | null;
    not_passed_text: string | null;
    topic: Topic;
}
interface Course {
    id: number;
    direction: Direction;
    name: string;
    short_name: string;
    description: string;
}
interface Homework {
    id: number;
    children_id: number;
    direction: Direction;
    lesson: Lesson;
    score: number;
    status: number;
    deadline_date: string | null;
}
interface ControlWork {
    id: number;
    children_id: number;
    work: {
        id: number;
        course: Course;
        material: {
            id: number;
            name: string;
        };
    };
    score: number;
    status: number;
    deadline_date: string | null;
}
interface ProbeWork {
    id: number;
    children_id: number;
    work: {
        id: number;
        course: Course;
        material: {
            id: number;
            name: string;
            probe_file: string | null;
        };
    };
    score: number;
    status: number;
    deadline_date: string | null;
}
interface ClassWork {
    attempt: number;
    can_redo: boolean;
    children_id: number;
    comment: string | null;
    completed_date: string | null;
    course_id: number;
    created_at: string;
    deadline_date: string;
    decided_right: boolean | null;
    direction: Direction;
    direction_id: number;
    expired_date: string | null;
    group_id: number;
    id: number;
    is_classwork: number;
    is_unique: number;
    lesson: Lesson;
    lesson_id: number;
    mark: number | null;
    min_points_scored: boolean;
    number_work: string;
    only_content: number;
    private_work_id: number | null;
    score: number;
    status: number;
    type: string;
    verified_by_id: number | null;
    verified_date: string | null;
    view: number;
}

export interface Teacher {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar_path: string | null;
    last_login: string;
}

export interface Seminarian {
    teacher: Teacher;
    total_hours: string;
    salary: string;
    pass: string;
    privateStudents: number;
}

export interface ReportResponse {
    income: string;
    sum_hours: string;
    profit: number;
    seminarians: Seminarian[];
    total_count: number;
}

interface ReportsState {
    data: ReportResponse | null;
    tab: 'private' | 'group';
    home_works: {
        data: Homework[];
        count: number;
    };
    control_works: {
        data: ControlWork[];
        count: number;
    };
    probe_works: {
        data: ProbeWork[];
        count: number;
    };
    class_works: {
        data: ClassWork[];
        count: number;
    },
    sop: {
        data: any[];
        count: number;
    };
    count: number;
    loading: boolean;
    error: string | null;
}

const initialState: ReportsState = {
    data: null,
    tab: 'private',
    home_works: {
        data: [],
        count: 0,
    },
    control_works: {
        data: [],
        count: 0,
    },
    probe_works: {
        data: [],
        count: 0,
    },
    class_works: {
        data: [],
        count: 0,
    },
    sop: {
        data: [],
        count: 0,
    },
    count: 0,
    loading: false,
    error: null,
};
//fetchReports
export const reportsOwnBacklog = createAsyncThunk(
    'reports/reportsOwnBacklog',
    async (_, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get('/v1/reports/own-backlog?expand=direction,lesson.topic,order.direction,work.course.direction,theme.course.direction');
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch reports');
        }
    }
);

export const fetchReports = createAsyncThunk(
    'reports/fetchReports',
    async (
        { from, up }: { from: string; up?: string },
        { getState }
    ) => {
        const state = getState() as { reports: ReportsState };
        const isPrivate = state.reports.tab === 'private';

        const baseParams = `date=${from}&expand=direction,tariff,children.reportParents`;
        const childUrl = `/v1/reports/child-for-parent-report?${baseParams}${isPrivate ? '&private=true' : ''}`;

        let seminaryUrl = '';

        if (isPrivate) {
            seminaryUrl = `/v1/reports/private-seminarian?date=${from}`;
            if (up) seminaryUrl += `&up=${up}`;
        } else {
            seminaryUrl = `/v1/reports/group-seminarian?from=${from}`;
            if (up) seminaryUrl += `&up=${up}`;
        }

        const [_, seminaryResponse] = await Promise.all([
            axiosInstance.get(childUrl),
            axiosInstance.get<ReportResponse>(seminaryUrl),
        ]);

        return seminaryResponse.data;
    }
);

const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        setTab(state, action) {
            state.tab = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(reportsOwnBacklog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(reportsOwnBacklog.fulfilled, (state, action: PayloadAction<ReportsState>) => {
                state.home_works = action.payload.home_works || initialState.home_works;
                state.control_works = action.payload.control_works || initialState.control_works;
                state.probe_works = action.payload.probe_works || initialState.probe_works;
                state.class_works = action.payload.class_works || initialState.class_works;
                state.sop = action.payload.sop || initialState.sop;
                state.count = action.payload.count || initialState.count;
                state.loading = false;
            })
            .addCase(reportsOwnBacklog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Неизвестная ошибка';
            })
            .addCase(fetchReports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReports.fulfilled, (state, action) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(fetchReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Ошибка загрузки';
            });
    },
});

export const { setTab } = reportsSlice.actions;
export default reportsSlice.reducer;
