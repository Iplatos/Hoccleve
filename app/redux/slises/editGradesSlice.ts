// redux/slises/editGradesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../services/axios/axiosConfig'

// Типы для запроса
export interface Grade {
  grade: number
  weight: number
  comment: string
  id?: number
}

export interface EditGradesPayload {
  date_id: string
  children_id: number
  status?: string
  comment?: string
  grades?: Grade[]
}

// Типы для ответа
export interface GradeResponse {
  id: string
  journal_id: string
  grade: string
  weight: string
  comment: string
  created_at: string | null
  updated_at: string | null
}

export interface EditGradesResponse {
  comment: string
  event_report_id: number
  member_id: number
  grades: GradeResponse[]
  status: string
}

export interface EditGradesState {
  loading: boolean
  error: string | null
  success: boolean
  lastUpdated: string | null
}

const initialState: EditGradesState = {
  loading: false,
  error: null,
  success: false,
  lastUpdated: null,
}

export const editGrades = createAsyncThunk(
  'editGrades/update',
  async (payload: EditGradesPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<{
        data: EditGradesResponse
        status: string
      }>('/v1/journal-beta/edit-grades', payload)

      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при обновлении оценок'
      )
    }
  }
)

const editGradesSlice = createSlice({
  name: 'editGrades',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    resetState: (state) => {
      state.loading = false
      state.error = null
      state.success = false
      state.lastUpdated = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(editGrades.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(editGrades.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.error = null
        state.lastUpdated = new Date().toISOString()

        console.log('Grades updated successfully:', action.payload)
      })
      .addCase(editGrades.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
        console.error('Failed to update grades:', action.payload)
      })
  },
})

export const { clearError, clearSuccess, resetState } = editGradesSlice.actions
export default editGradesSlice.reducer
