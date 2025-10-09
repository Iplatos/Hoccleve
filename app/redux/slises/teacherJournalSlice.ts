// features/teacherJournal/teacherJournalSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../services/axios/axiosConfig'

// Упрощенные типы для начала
export interface TeacherJournalStudent {
  id: number
  name: string
  groups: number[]
}

export interface TeacherJournalDate {
  id: string
  date: string
}

export interface TeacherJournalData {
  dates: TeacherJournalDate[]
  children: TeacherJournalStudent[]
}

export interface TeacherJournalState {
  data: TeacherJournalData | null
  loading: boolean
  error: string | null
}

// Начальное состояние
const initialState: TeacherJournalState = {
  data: null,
  loading: false,
  error: null,
}

export const fetchTeacherJournalData = createAsyncThunk(
  'teacherJournal/fetchData',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/v1/journal-beta/general-journal', { params })

      if (response.data.status === 'success') {
        return response.data.data
      } else {
        return rejectWithValue('API returned error status')
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке журнала учителя')
    }
  }
)

// Создаем слайс
const teacherJournalSlice = createSlice({
  name: 'teacherJournal',
  initialState,
  reducers: {
    clearTeacherJournalData: (state) => {
      state.data = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherJournalData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTeacherJournalData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchTeacherJournalData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearTeacherJournalData } = teacherJournalSlice.actions
export default teacherJournalSlice.reducer
