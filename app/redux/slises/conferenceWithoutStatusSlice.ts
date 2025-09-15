import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios/axiosConfig.ts";

export interface Meta {
    pageCount: number;
    totalCount: number;
    currentPage: number;
    perPage: number;
}

export interface Link {
    href: string;
}

export interface Links {
    self: Link;
    next?: Link;
    prev?: Link;
    last?: Link;
    first?: Link;
}

export interface Direction {
    id: string;
    name: string;
    short_name: string;
    description: string;
    icon_path: string | null;
    created_at: string;
    updated_at: string;
    code: string | null;
    start_price: string;
    use_promo_code: string;
    use_discount: string;
    filter_id: string;
    seminarian_id: string | null;
    permission_add_child: string;
    view: string;
    old_price: string;
    sorting: string;
    flag_easily_creating: string;
    flag_one_block: string;
    icon_media_id: string | null;
    sub_folder_id: string | null;
    flag_allow_certificate: string;
    certificate_unlock_percentage: string;
    has_demo: string;
    duration_in_months: string | null;
    media_icon_id: string | null;
    certificate_template_id: string | null;
}

export interface Student {
    id: string;
    group_id: string;
    children_id: string;
    created_at: string;
    updated_at: string;
    status: string;
    paid_up_to: string | null;
}

export interface Group {
    id: string;
    direction_id: string;
    teacher_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    any_seminarian: string;
    direction: Direction;
    students: Student[];
}

export interface Children {
    id: string;
    phone: string | null;
    email: string;
    status: string;
    password_hash: string;
    auth_key: string;
    verification_token: string | null;
    password_reset_token: string | null;
    created_at: string;
    updated_at: string;
    name: string;
    avatar_path: string | null;
    promo_code: string;
    pulses: string;
    balance: string;
    access_token: string | null;
    vk_id: string | null;
    balance_euro: string;
    balance_dollar: string;
    custom_id: string | null;
    last_login: string;
}

export interface ConferenceItem {
    id: string;
    event_id: string;
    date_conference: string;
    status: string;
    comment: string | null;
    children_id: string | null;
    children: Children | null;
    group: Group | null;
    conference_type: string;
    duration: number;
    direction_id: string;
    direction_course_id: string | null;
    end_time: string;
    start_time: string;
    start_date: string;
    end_date: string | null;
    interval_type: string;
    journalTimetables: any[]; // если нужны детали, уточни структуру
    speaker_id: string;
    created_at: string;
    opened_at: string | null;
    link_to_meeting: string;
}

export interface ConferenceWithoutStatusResponse {
    _meta: Meta;
    _links: Links;
    data: ConferenceItem[];
}

export type RecordEntryTimeType = {
    "status": string,
    "data": string,
    "entry_time": string
}

export interface MassReportItem {
    cancel_type: string;
    comment: string;
    date_conference: string;
    event_id: string;
    id: string;
    lesson_time_change: number;
}

export interface MassReportSuccessResponse {
    status: 'success';
    data: {
        id: number;
        event_id: number;
        status: number;
        comment: string;
        date_conference: string;
        created_at: number;
        updated_at: number;
        lesson_topic: string | null;
        comment_to_dz: string | null;
        opened_at: string;
        duration: number;
    }[];
}

export type UpdateConferenceType = {
    comment?: string;
    cancel_type?: string,
    date_conference?: string;
    lesson_time_change?: number;
    id?: number
}


interface ConferenceState {
    data: ConferenceItem[];
    saveTimeOpeningLessonFirstTime: RecordEntryTimeType | null;
    loading: boolean;
    error: string | null;
    isUpdateConferenceLoading: boolean;
    isSendMassReportLoading: boolean;
    massReportData: MassReportSuccessResponse | null;
}

const initialState: ConferenceState = {
    data: [],
    loading: false,
    saveTimeOpeningLessonFirstTime: null,
    error: null,
    isSendMassReportLoading: false,
    isUpdateConferenceLoading: false,
    massReportData: null
};

export const fetchConferencesWithoutStatus = createAsyncThunk<
    ConferenceItem[],
    void,
    { rejectValue: string }
>('conferenceWithoutStatus/fetch', async (_, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get('/v1/timetable/conference-without-status');
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Ошибка загрузки конференций');
    }
});

export const saveTimeOpeningLessonFirstTime = createAsyncThunk<
    RecordEntryTimeType,
    string,
    { rejectValue: string }
>('conferenceWithoutStatus/saveTimeOpeningLessonFirstTime', async (id, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.post('/v1/timetable-report/record-entry-time', {id});
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.error?.[0] || error.message || 'Ошибка при сохранении времени входа';
        return rejectWithValue(message);
    }
});

export const updateConferenceStatus = createAsyncThunk<
    { status: string; data: any },
    UpdateConferenceType,
    { rejectValue: string }
>('conference/updateStatus', async (payload, {rejectWithValue}) => {
    try {
        const {comment, date_conference, cancel_type, lesson_time_change, id} = payload;
        const response = await axiosInstance.post(`/v1/timetable/done?id=${id}`, {
            comment,
            date_conference,
            lesson_time_change,
            cancel_type
        });

        return response.data; // Ответ от сервера
    } catch (error: any) {
        const message = error.response?.data?.error?.[0] || error.message || 'Ошибка при обновлении статуса';
        return rejectWithValue(message);
    }
});

export const sendMassReport = createAsyncThunk<
    MassReportSuccessResponse,
    MassReportItem[],
    { rejectValue: string }
>('conferenceWithoutStatus/sendMassReport', async (data, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.post('/v1/timetable/mass-report', data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.error?.[0] || error.message || 'Ошибка при массовом отчёте'
        );
    }
});


const conferenceWithoutStatusSlice = createSlice({
    name: 'conferenceWithoutStatus',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchConferencesWithoutStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConferencesWithoutStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchConferencesWithoutStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Неизвестная ошибка';
            })
            .addCase(saveTimeOpeningLessonFirstTime.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveTimeOpeningLessonFirstTime.fulfilled, (state, action) => {
                state.loading = false;
                state.saveTimeOpeningLessonFirstTime = action.payload;
            })
            .addCase(saveTimeOpeningLessonFirstTime.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Неизвестная ошибка';
            })
            .addCase(updateConferenceStatus.pending, (state) => {
                state.isUpdateConferenceLoading = true;
                state.error = null;
            })
            .addCase(updateConferenceStatus.fulfilled, (state, action) => {
                state.isUpdateConferenceLoading = false;
                // Можем обновить данные о статусе конференции, если нужно
                // Например:
                // const updatedConference = action.payload.data;
                // state.data = state.data.map(conference =>
                //     conference.id === updatedConference.id ? updatedConference : conference
                // );
            })
            .addCase(updateConferenceStatus.rejected, (state, action) => {
                state.isUpdateConferenceLoading = false;
                state.error = action.payload ?? 'Неизвестная ошибка';
            })
            .addCase(sendMassReport.pending, (state) => {
                state.isSendMassReportLoading = true;
                state.error = null;
            })
            .addCase(sendMassReport.fulfilled, (state, action) => {
                state.isSendMassReportLoading = false;
                state.massReportData = action.payload;
            })
            .addCase(sendMassReport.rejected, (state, action) => {
                state.isSendMassReportLoading = false;
                state.error = action.payload ?? 'Неизвестная ошибка';
            });
    },
});

export default conferenceWithoutStatusSlice.reducer;