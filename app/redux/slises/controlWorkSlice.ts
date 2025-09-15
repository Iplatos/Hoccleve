import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Типизация для ControlTask
import {Order} from "./probeWorkSlice.ts";
import axiosInstance from "../../services/axios/axiosConfig.ts";
import {Task} from "./homeworkSlice.ts";

export interface ControlTask {
    id: number;
    sorting: number;
    task: Task;
}

interface ControlWorkResult {
    id: number;
    children_id: number;
    work_id: number;
    task_id: number;
    verified_by_id: number | null;
    answer: string;
    score: number;
    decided_right: number;
    prompt: string | null;
    comment: string | null;
    comment_files: string | null;
    created_at: number;
    updated_at: number;
    answer_type: string;
    correct_answer: string;
    answer_files: string | null;
}

// Типизация для Material
interface Material {
    id: number;
    name: string;
    type: string;
    description: string;
    probe_file: string | null;
    sorting: number;
    course_id: number;
    estimated_at: string | null;
    controlTasks: ControlTask[];
}

// Типизация для Work
interface Work {
    id: number;
    course_id: number;
    type: string;
    status: number;
    material: Material;
    group_id: number;
    children_id: number;
    order: Order;
}

// Типизация для ControlWork
interface ControlWork {
    id: number;
    children_id: number;
    work_id: number;
    verified_by_id: number | null;
    status: number;
    score: number;
    decided_right: number | null;
    left_time: number | null;
    expired_date: string | null;
    deadline_date: string;
    start_date: string | null;
    update_date: string | null;
    completed_date: string | null;
    unpause_date: string | null;
    comment: string | null;
    verified_date: string | null;
    mark: number | null;
    work: Work;
    controlWorkResults: ControlWorkResult[];
}

// Типизация ответа API
export interface FetchControlWorkResponse {
    id: number;
    children_id: number;
    work_id: number;
    verified_by_id: number | null;
    status: number;
    score: number;
    name: string;
    decided_right: number | null;
    left_time: number | null;
    expired_date: string | null;
    deadline_date: string;
    start_date: string | null;
    update_date: string | null;
    completed_date: string | null;
    unpause_date: string | null;
    comment: string | null;
    verified_date: string | null;
    mark: number | null;
    work: Work;
    controlWorkResults: ControlWorkResult[];
    controlTasks: ControlTask[];
}


interface ControlWorkState {
    data: FetchControlWorkResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: ControlWorkState = {
    data: null,
    loading: false,
    error: null,
};

// Асинхронное действие для получения данных контрольной работы
export const fetchControlWork = createAsyncThunk(
    'controlWork/fetchControlWork',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get<FetchControlWorkResponse>(
                `/v1/control-work/view?expand=work.material.controlTasks.task.homeTaskFiles,controlWorkResults,theme.controlTasks.task.homeTaskFiles&id=${id}`
            );
            return response.data;
        } catch (error: any) {
          //  console.log('catch', error)
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || 'Произошла ошибка при загрузке контрольной работы');
        }
    }
);

export const fetchControlWorkBySeminarian = createAsyncThunk(
    'controlWork/fetchControlWorkBySeminarian',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get<FetchControlWorkResponse>(
                `/v1/course-material/view/${id}?expand=controlTasks,course,course.direction,controlTasks.task,controlTasks.task.numberExam,controlTasks.task.homeTaskFiles&id=${id}`
            );
            return response.data;
        } catch (error: any) {
            //  console.log('catch', error)
            if (error.response) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue(error.message || 'Произошла ошибка при загрузке контрольной работы');
        }
    }
);

const controlWorkSlice = createSlice({
    name: 'controlWork',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchControlWork.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchControlWork.fulfilled, (state, action: PayloadAction<FetchControlWorkResponse>) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(fetchControlWork.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload || 'Не удалось загрузить данные контрольной работы';
            })
            .addCase(fetchControlWorkBySeminarian.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchControlWorkBySeminarian.fulfilled, (state, action: PayloadAction<FetchControlWorkResponse>) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(fetchControlWorkBySeminarian.rejected, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.error = action.payload || 'Не удалось загрузить данные контрольной работы';
            });
    },
});

export default controlWorkSlice.reducer;
