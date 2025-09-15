import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios/axiosConfig.ts";
import {Type} from "./studentCoursesSlice.ts";

export interface LessonType {
    id: number;
    name: string;
    isActive: number;
    isFinished: number;
    sorting: number;
    work_link: string | null;
    type: string;
    work_id: number | null;
    survey_required: number;
    is_survey_passed: boolean;
}

interface ThemeLessonsState {
    data: LessonType[];
    theme_name: string;
    courseVisibility: number;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: ThemeLessonsState = {
    data: [],
    theme_name: "",
    courseVisibility: 0,
    status: "idle",
    error: null,
};

export const fetchThemeLessons = createAsyncThunk(
    "themeLessons/fetchThemeLessons",
    async ({themeId, groupId, type}: { themeId?: number; groupId?: number, type?: Type }, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(
                `/v1/direction-plan-beta/get-theme-lessons`,
                {
                    params: {themeId, type, groupId},
                }
            );
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Ошибка запроса");
        }
    }
);

const themeLessonsSlice = createSlice({
    name: "themeLessons",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchThemeLessons.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchThemeLessons.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.data = action.payload.data;
                state.theme_name = action.payload.theme_name;
                state.courseVisibility = action.payload.courseVisibility;
            })
            .addCase(fetchThemeLessons.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export default themeLessonsSlice.reducer;
