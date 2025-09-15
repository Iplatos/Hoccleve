import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from "../../services/axios/axiosConfig.ts";

export interface Task {
    id: number;
    number_exam_id: number;
    topic_id: number | null;
    subtopic_id: number | null;
    question: string; // Можете использовать дополнительную типизацию для структуры вопроса, если это необходимо
    type: string;
    answer_options: string; // Предположительно JSON строка
    complexity: number;
    key_text: string | null;
    exam_weight: string; // Предположительно JSON строка
    option_all_number_right: number | null;
    option_all_mismatch: number | null;
    option_not_all_mismatch: number | null;
    created_at: number;
    updated_at: number;
    question_file: string | null;
    option_order_matters: boolean | null;
    option_all_mismatch_order: boolean | null;
    option_one_mismatch_order: boolean | null;
    direction_id: number;
    homeTaskFiles: FileData[]; // Массив файлов, может потребоваться уточнение
}
export interface FileData {
    file_path: string;
    id: number;
    task_id: number;
    type: 'image' | 'audio' | 'key';
}

interface ProbeTask {
    id: number;
    task_id: number;
    sorting: number;
    task: Task;
}

interface Material {
    id: number;
    name: string;
    type: string;
    description: string; // Можете использовать дополнительную типизацию для структуры описания, если это необходимо
    probe_file: string;
    sorting: number;
    course_id: number;
    estimated_at: number | null;
    probeTasks: ProbeTask[];
}

export interface Order {
    id: number;
    direction_id: number;
    children_id: number;
    tariff_id: number;
    learning_class: number | null;
    teacher_id: number | null;
    group_id: number;
    buy_months: number;
    buy_hours: number | null;
    status_payment: number;
    comment: string | null;
    distribution: number;
    payment_amount: string;
    next_payment_date: string;
    created_at: number;
    updated_at: number;
    countParentReports: number;
    data_filled: number;
    send_to_bot: number;
    parent_touch: number;
    is_disabled: number;
    auto_renewal: boolean;
    class_id: number | null;
}

interface Work {
    id: number;
    course_id: number;
    type: string;
    status: number;
    material: Material;
    group_id: number;
    children_id: number;
    order: Order
}

interface ProbeWorkData {
    id: number;
    children_id: number;
    work_id: number;
    verified_by_id: number | null;
    status: number;
    score: number;
    left_time: number;
    expired_date: string | null;
    deadline_date: string;
    start_date: number;
    completed_date: string | null;
    probe_files: string | null;
    update_date: number;
    verified_date: string | null;
    decided_right: string | null;
    comment: string | null;
    mark: string | null;
    results: any[]; // Можете уточнить структуру данных
    work: Work;
}

interface ProbeWorkResponse {
    status: string;
    data: ProbeWorkData;
}



export interface ProbeWorkState {
    data: ProbeWorkData | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProbeWorkState = {
    data: null,
    loading: false,
    error: null,
};

export const fetchProbeWork = createAsyncThunk<ProbeWorkData, number>(
    'probeWork/fetchProbeWork',
    async (planId, thunkAPI) => {
        try {
            const response = await axiosInstance.get<ProbeWorkResponse>(
                `/v1/probe/?expand=work.material.probeTasks.task.homeTaskFiles&planId=${planId}`
            );
            return response.data.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const probeWorkSlice = createSlice({
    name: 'probeWork',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProbeWork.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProbeWork.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchProbeWork.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default probeWorkSlice.reducer;
