// features/periods/periodsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../services/axios/axiosConfig'

export interface Period {
  id: number
  name: string
  start_date: string
  end_date: string
}

export const fetchPeriods = createAsyncThunk(
  'periods/fetchPeriods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/v1/journal-periods/list')

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке периодов')
    }
  }
)

const periodsSlice = createSlice({
  name: 'periods',
  initialState: {
    periods: [] as Period[],
    loading: false,
    error: null as string | null,
    selectedPeriod: null as Period | null,
  },
  reducers: {
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPeriods.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPeriods.fulfilled, (state, action) => {
        state.loading = false
        state.periods = action.payload
        // Автоматически выбираем первый период
        if (action.payload.length > 0) {
          state.selectedPeriod = action.payload[0]
        }
      })
      .addCase(fetchPeriods.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedPeriod } = periodsSlice.actions
export default periodsSlice.reducer
