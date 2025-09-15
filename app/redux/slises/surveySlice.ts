import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios/axiosConfig.ts";

export interface SurveySettings {
    surveyId: number;
    name: string;
    theme: string;
    backLink: string | null;
    isAnonymousAllowed: number;
}

export interface AnswerOption {
    id: string;
    option: {
        type: string;
        content: { type: string; content: { type: string; text: string }[] }[];
    };
    unit: string;
}

export interface SurveyCondition {
    field: string; // всегда "answerOptions"
    id: string; // ID текущего вопроса
    questionId: string; // от какого вопроса зависит
    value: string; // значение, при котором показать
}

export interface SurveyQuestion {
    id: string;
    survey_id: string;
    answerOptions: AnswerOption[];
    questionText: {
        type: string;
        content: { type: string; content: { type: string; text: string }[] }[];
    };
    conditions?: SurveyCondition[];
    questions: SurveyQuestion[]
    type: string;
    order: number;
    multiple: number;
    state: string;
    min: string;
    max: number;
    step: number;
    answers?: string;
}

export interface SurveyData {
    settings: SurveySettings;
    questions: SurveyQuestion[];
    reportStatus: any;
}

export interface MySurveyAbout {
    name: string;
    description: string;
    id: string;                // если точно число — можно заменить на number
    type: string;              // если тип всегда число, лучше тоже заменить на number
    completionDate: string | null;
    completed: boolean;
    uuid: string;
    report_id: number;
    lesson_id: number | null;
}

export interface Meta {
    totalCount: string;       // если это всегда строка, оставляем, иначе можно number
    perPage: string;
    currentPage: string;
    pageCount: number;
}

export type MySurveyResponse = {
    data: SurveyData,
    _meta: Meta;
}


export interface SurveyState {
    data: SurveyData | null;
    mySurveyAbout: MySurveysResponse | null;
    mySurvey: SurveyData | null;
  //  mySurvey: MySurveyResponse | null,
    loading: boolean;
    error: string | null;
    reportId: number | null;
    reportLoading: boolean;
    reportError: string | null;
    completeSurveyStatus: boolean,
    completeSurveyLoading: boolean,
    completeSurveyError: string | null,
}

interface FetchMySurveysParams {
    completed?: boolean;
    perPage?: number;
    page?: number;
    userId: number;
}

const initialState: SurveyState = {
    data: null,
    mySurveyAbout: null,
    mySurvey: null,
    loading: false,
    error: null,
    reportId: null,
    reportLoading: false,
    reportError: null,
    completeSurveyStatus: false,
    completeSurveyLoading: false,
    completeSurveyError: null,
};

interface FetchMySurveyParams {
    surveyId: number;
}

export interface MySurveysResponse {
    data: MySurveyAbout[];
    _meta: Meta;
}


export const createSurveyReport = createAsyncThunk(
    "survey/createReport",
    async (
        {openLesson, forLesson, survey_id, user_id}: {
            openLesson: number;
            forLesson: number;
            survey_id: string;
            user_id: number
        },
        {rejectWithValue}
    ) => {
        try {
            const params: Record<string, any> = {};
            if (survey_id) params.survey_id = survey_id;
            if (user_id) params.user_id = user_id;
            if (forLesson) params.for_lesson = String(forLesson); // Приводим к строке

            const response = await axiosInstance.post(
                `/v1/survey/create-report?openLesson=${openLesson}&forLesson=${forLesson}`,
                params
            );

            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchSurvey = createAsyncThunk(
    "survey/fetchSurvey",
    async (surveyId: number, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(
                `/v1/survey/get-pass?id=${surveyId}`
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchMySurvey = createAsyncThunk<SurveyData, FetchMySurveyParams, { rejectValue: string }>(
    'survey/fetchMySurvey',
    async ({surveyId}, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(`/v1/survey/get-pass`, {
                params: {
                    survey_report_id: surveyId,
                },
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchMySurveyAbout = createAsyncThunk<MySurveysResponse, FetchMySurveysParams>(
    "survey/fetchMySurveyAbout",
    async (
        {completed = false, perPage = 20, page = 1, userId}: FetchMySurveysParams,
        {rejectWithValue}
    ) => {
        try {
            const response = await axiosInstance.get<MySurveysResponse>(
                `/v1/survey/get-my-survey?filter[completed]=${completed}&per-page=${perPage}&page=${page}&user_id=${userId}`
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


export const sendSurveyAnswers = createAsyncThunk(
    "survey/sendAnswers",
    async (
        {
            answers,
            report_survey_id,
            surveyId,
            user_id
        }: {
            answers: Record<string, any>;
            report_survey_id: number;
            surveyId?: string;
            user_id: number;
        },
        {rejectWithValue}
    ) => {
        try {
            const dataSend = Object.entries(answers).map(([id, value]) => {
                if (Array.isArray(value)) {
                    return {id, answers: value};
                } else {
                    return {id, answer: value};
                }
            });

            const sendData = {
                answers: dataSend,
                report_survey_id,
                surveyId,
                user_id,
            };

            const response = await axiosInstance.post("/v1/survey/take-survey", sendData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const markSurveyCompleted = createAsyncThunk(
    "survey/markSurveyCompleted",
    async (
        {lessonId, userId}: { lessonId: number; userId: number },
        {rejectWithValue}
    ) => {
        try {
            const response = await axiosInstance.post(
                `/v1/topic-lesson/lesson-completed/${lessonId}`,
                {userId}
            );

            return response.data; // { data: "Успешно", status: "success" }
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const surveySlice = createSlice({
    name: "survey",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createSurveyReport.pending, (state) => {
                state.reportLoading = true;
                state.reportError = null;
            })
            .addCase(createSurveyReport.fulfilled, (state, action) => {
                state.reportLoading = false;
                state.reportId = action.payload.id;
            })
            .addCase(createSurveyReport.rejected, (state, action) => {
                state.reportLoading = false;
                state.reportError = action.payload as string;
            })
            .addCase(fetchSurvey.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSurvey.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchSurvey.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(sendSurveyAnswers.pending, (state) => {
                state.reportLoading = true;
                state.reportError = null;
            })
            .addCase(sendSurveyAnswers.fulfilled, (state, action) => {
                state.reportLoading = false;
                // Можно сюда сохранить успешное сообщение, если нужно
                console.log("Ответы успешно отправлены:", action.payload);
            })
            .addCase(sendSurveyAnswers.rejected, (state, action) => {
                state.reportLoading = false;
                state.reportError = action.payload as string;
            })
            .addCase(markSurveyCompleted.pending, (state) => {
                state.completeSurveyLoading = true;
                state.completeSurveyError = null;
            })
            .addCase(markSurveyCompleted.fulfilled, (state, action) => {
                state.completeSurveyLoading = false;
                state.completeSurveyStatus = action.payload;
            })
            .addCase(markSurveyCompleted.rejected, (state, action) => {
                state.completeSurveyLoading = false;
                state.completeSurveyError = action.payload as string;
            })
            .addCase(fetchMySurveyAbout.pending, (state) => {
                state.completeSurveyLoading = true;
                state.completeSurveyError = null;
            })
            .addCase(fetchMySurveyAbout.fulfilled, (state, action) => {
                state.completeSurveyLoading = false;
                state.mySurveyAbout = action.payload;
            })
            .addCase(fetchMySurveyAbout.rejected, (state, action) => {
                state.completeSurveyLoading = false;
                state.completeSurveyError = action.payload as string;
            })
            .addCase(fetchMySurvey.pending, (state) => {
                state.completeSurveyLoading = true;
                state.completeSurveyError = null;
            })
            .addCase(fetchMySurvey.fulfilled, (state, action) => {
                state.completeSurveyLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchMySurvey.rejected, (state, action) => {
                state.completeSurveyLoading = false;
                state.completeSurveyError = action.payload as string;
            })
    },
});

export default surveySlice.reducer;