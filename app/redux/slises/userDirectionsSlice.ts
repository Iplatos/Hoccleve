// features/userDirections/userDirectionsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../services/axios/axiosConfig'

export interface DirectionTariff {
  id: number
  isCheckboxesView: number
  direction_id: number
  name: string
  description: string
  currency: string
  type: string
  view: number
  // ... другие поля тарифа
}

export interface Direction {
  id: number
  name: string
  short_name: string
  description: string
  icon_path: string
  start_price: string
  old_price: string
  directionTariffs: DirectionTariff[]
  // ... другие поля направления
}

export interface UserDirection {
  direction: Direction
  direction_id: number
  id: number
  rate: number
  rate_group: number
  seminarian_id: number
}

export const fetchUserDirections = createAsyncThunk(
  'userDirections/fetchUserDirections',
  async (seminarianId: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/v1/user/directions-by-seminarian?seminarianId=${seminarianId}&expand=direction.directionTariffs`
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при загрузке направлений пользователя'
      )
    }
  }
)

interface UserDirectionsState {
  userDirections: UserDirection[]
  loading: boolean
  error: string | null
}

const initialState: UserDirectionsState = {
  userDirections: [],
  loading: false,
  error: null,
}

const userDirectionsSlice = createSlice({
  name: 'userDirections',
  initialState,
  reducers: {
    clearUserDirections: (state) => {
      state.userDirections = []
      state.error = null
    },
    resetUserDirectionsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDirections.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserDirections.fulfilled, (state, action) => {
        state.loading = false
        state.userDirections = action.payload
      })
      .addCase(fetchUserDirections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearUserDirections, resetUserDirectionsState } = userDirectionsSlice.actions
export default userDirectionsSlice.reducer
