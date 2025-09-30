// features/journal/journalSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../services/axios/axiosConfig'

// Типы
export interface JournalDate {
  id: string
  date: string
  ids: string[]
  lesson_topic: string
  comment_to_dz: string
}

export interface JournalDirection {
  id: string
  group_id: number
  name: string
  absences: number
  visits: number
  attendance: number
  gpa: number
}

export interface JournalData {
  dates: JournalDate[]
  directions: JournalDirection[]
}

export interface JournalApiResponse {
  status: 'success' | 'error'
  data: JournalData
}

export interface JournalState {
  data: JournalData | null
  loading: boolean
  error: string | null
  params: {
    start_date: string
    end_date: string
  }
}

// Начальное состояние
const initialState: JournalState = {
  data: null,
  loading: false,
  error: null,
  params: {
    start_date: '',
    end_date: '',
  },
}

// Асинхронный thunk ДО слайса
export const fetchJournalData = createAsyncThunk(
  'journal/fetchData',
  async (params: { start_date: string; end_date: string }, { rejectWithValue }) => {
    try {
      console.log('Fetching journal data with params:', params)

      const response = await axiosInstance.get<JournalApiResponse>(
        '/v1/journal-beta/general-student-journal',
        {
          params: {
            start_date: params.start_date,
            end_date: params.end_date,
          },
        }
      )

      console.log('Journal response:', response.data)

      // Проверяем статус ответа
      if (response.data.status === 'success') {
        return response.data.data // возвращаем только data из ответа
      } else {
        return rejectWithValue('API returned error status')
      }
    } catch (error: any) {
      console.error('Journal API Error:', error)
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке журнала')
    }
  }
)

// Создаем слайс
const generalStudentJournalSlice = createSlice({
  name: 'generalStudentJournal',
  initialState,
  reducers: {
    clearJournalData: (state) => {
      state.data = null
      state.error = null
    },
    setParams: (state, action) => {
      state.params = { ...state.params, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournalData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchJournalData.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
        state.error = null
      })
      .addCase(fetchJournalData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.data = null
      })
  },
})

// Экспортируем actions и reducer
export const { clearJournalData, setParams, clearError } = generalStudentJournalSlice.actions
export default generalStudentJournalSlice.reducer
