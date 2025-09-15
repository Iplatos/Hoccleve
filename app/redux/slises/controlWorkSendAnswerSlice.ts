import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';

import axiosInstance from "../../services/axios/axiosConfig.ts";

// Типизация данных, которые отправляются на сервер
interface SendAnswerPayload {
    answer: string | any[];
    children_id: number;
    answer_type: string;
    task_id: number;
    lesson_id: number;
    answer_files?: any
}

// Типизация данных, которые возвращаются сервером
export interface AnswerResponse {
    status: string;
    data: {
        decided: boolean;
        message: string;
        prompt: string;
        attempt: number;
        score: number;
    };
}

// Типизация состояния слайса
interface AnswerState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    result: { [taskId: number]: AnswerResponse['data'] | null }; // Добавляем taskId
}

// Начальное состояние
const initialState: AnswerState = {
    status: 'idle',
    error: null,
    result: {},
};

// Асинхронный thunk для отправки ответа на сервер
export const sendControlWorkAnswer = createAsyncThunk<AnswerResponse & { task_id: number }, SendAnswerPayload>(
    'answer/sendControlWorkAnswer',
    async ({ answer, answer_files, children_id, answer_type, task_id, lesson_id }, { rejectWithValue }) => {
      //  console.log(answer, answer_files, children_id, answer_type, task_id, lesson_id)
        try {
            const formData = new FormData();

            if (answer_files) {
                answer_files.forEach((file: any, index: number) => {
                    formData.append('answer_files[]', {
                        uri: file.uri, // Путь к файлу (например, для iOS или Android)
                        name: file.name || `file_${index}`, // Имя файла
                        type: file.type || 'application/octet-stream', // MIME-тип файла
                    });
                });
            }

            // Если answer — это массив файлов, добавляем их в formData
            if (Array.isArray(answer)) {
                answer.forEach((file: any, index: number) => {
                    formData.append('answer', {
                        uri: file.uri, // Путь к файлу (например, для iOS или Android)
                        name: file.name || `file_${index}`, // Имя файла
                        type: file.type || 'application/octet-stream', // MIME-тип файла
                    });
                });
            } else {
                // Если answer — это текстовый ответ
                formData.append('answer', answer);
            }

            formData.append('children_id', String(children_id));
            formData.append('answer_type', answer_type);
            formData.append('task_id', String(task_id));

            const response = await axiosInstance.post(
                `/v1/control-work/send-answer/${lesson_id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // Включаем task_id в ответ
            return { ...response.data, task_id };
        } catch (error: any) {
            console.log('error.response.data', error.response.data);
            return rejectWithValue(error.response.data);
        }
    }
);

// Создание слайса
const sendControlWorkAnswerSlice = createSlice({
    name: 'sendControlWorkAnswer',
    initialState,
    reducers: {
        resetResultControlWork(state) {
            state.result = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendControlWorkAnswer.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(sendControlWorkAnswer.fulfilled, (state, action: PayloadAction<AnswerResponse & { task_id: number }>) => {
                state.status = 'succeeded';
                state.result[action.payload.task_id] = action.payload.data; // Сохраняем по task_id
            })
            .addCase(sendControlWorkAnswer.rejected, (state, action: PayloadAction<any>) => {
                state.status = 'failed';
                state.error = action.payload.message;
            });
    },
});


export const {resetResultControlWork} = sendControlWorkAnswerSlice.actions
export default sendControlWorkAnswerSlice.reducer;
