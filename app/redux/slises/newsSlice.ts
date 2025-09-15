// newsSlice.ts
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from "../../services/axios/instans.ts";
import {AppDispatch} from "../store/store.ts";

export interface News {
    id: number;
    title: string;
    text: string;
    date: string;
    image: string;
    image_type: string;
    authorized_only: number;
    link: string | null;
    user_id: number;
    draft: number;
    created_at: string | null;
    updated_at: string | null;
    external: number;
    href: string | null;
    image_name: string;
    newsLikes: Array<{
        id: number;
        news_id: number;
        user_id: number;
        created_at: string | null;
        updated_at: string | null
    }>;
    likes: number;
    comments: number;
    likedByMe: boolean;
}
export interface NewsComment {
    user_id: number;
    news_id: number;
    comment: string;
    date: string;
    name: string;
    id: number;
}

interface FetchCommentsParams {
    newsId: number;
    first: number;
    last: number;
}

interface NewsState {
    data: News[];
    currentNews: News | null;
    comments: NewsComment[];
    commentsPage: number;
    hasMoreComments: boolean;
    isLoadingComments: boolean,
    commentsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: NewsState = {
    data: [],
    currentNews: null,
    comments: [],
    commentsPage: 0,
    hasMoreComments: true,
    isLoadingComments: false,
    commentsStatus: 'idle',
    status: 'idle',
    error: null,
};

export const fetchNews = createAsyncThunk('news/fetchNews', async (_, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get<News[]>('/v1/news');
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return rejectWithValue(err.response.data);
        }
        // @ts-ignore
        return rejectWithValue(err.message);
    }
});

export const fetchNew = createAsyncThunk<
    News,
    number,
    { rejectValue: string; dispatch: AppDispatch }
>(
    'news/fetchNew',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await axiosInstance.get<News>(`/v1/news/view/${id}`);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            // @ts-ignore
            return rejectWithValue(err.message);
        }
    }
);

export const createComment = createAsyncThunk(
    'news/createComment',
    async (
        { newsId, comment }: { newsId: number; comment: string },
        { dispatch, rejectWithValue }
    ) => {
        try {
            const formData = new FormData();
            formData.append('comment', comment);

            const response = await axiosInstance.post<NewsComment>(
                `/v1/news/create-comment/${newsId}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            // // Обновим комментарии сразу после успешной отправки
            // dispatch(fetchComments(newsId));

            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            // @ts-ignore
            return rejectWithValue(err.message);
        }
    }
);

export const fetchComments = createAsyncThunk<
    NewsComment[], // просто возвращаем массив комментариев
    FetchCommentsParams,
    { rejectValue: string }
>(
    'news/fetchComments',
    async ({ newsId, first, last }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get<NewsComment[]>(
                `/v1/news/comments/${newsId}?first=${first}&last=${last}`
            );
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data);
            }
            // @ts-ignore
            return rejectWithValue(err.message);
        }
    }
);

export const toggleLike = createAsyncThunk('news/toggleLike', async (newsId: number, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/v1/news/toggle-like/${newsId}`);
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return rejectWithValue(err.response.data);
        }
        // @ts-ignore
        return rejectWithValue(err.message);
    }
});

const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNews.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNews.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchNews.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(fetchNew.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNew.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentNews = action.payload;
            })
            .addCase(fetchNew.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            .addCase(toggleLike.fulfilled, (state, action) => {
                const response = action.payload;
                const newsId = action.meta.arg;
                const newsItem = state.data.find(news => news.id === newsId);

                if (newsItem) {
                    if (typeof response === 'object') {
                        // Лайк был добавлен
                        newsItem.likedByMe = true;
                        newsItem.likes += 1;
                    } else {
                        // Лайк был убран
                        newsItem.likedByMe = false;
                        newsItem.likes -= 1;
                    }
                }
            })
            .addCase(toggleLike.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            .addCase(fetchComments.pending, (state) => {
                state.isLoadingComments = true;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.comments.push(...action.payload);
                state.commentsPage += 1;

                // Сравниваем количество уже загруженных комментариев с общим числом
                const total = state.currentNews?.comments || 0;
                state.hasMoreComments = state.comments.length < total;

                state.isLoadingComments = false;
            })
            .addCase(fetchComments.rejected, (state) => {
                state.isLoadingComments = false;
            })
            .addCase(createComment.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.comments.push(action.payload); // добавляем новый комментарий в список
                state.status = 'succeeded';
            })
            .addCase(createComment.rejected, (state, action) => {
                state.error = action.payload as string;
                state.status = 'failed';
            })
    },
});

export default newsSlice.reducer;
