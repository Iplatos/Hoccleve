// features/directionGroup/directionGroupSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../services/axios/axiosConfig'

export interface DirectionGroups {
  direction_id: number
  name: string
  value: number
}

export const fetchDirectionGroupWithReplacement = createAsyncThunk(
  'directionGroup/fetchDirectionGroupWithReplacement',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/v1/direction-group/with-replacement?id=${id}`)

      return response.data.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка при загрузке группы направлений'
      )
    }
  }
)

interface DirectionGroupState {
  directionGroups: DirectionGroups[] | null
  loading: boolean
  error: string | null
}

const initialState: DirectionGroupState = {
  directionGroups: [],
  loading: false,
  error: null,
}

const directionGroupSlice = createSlice({
  name: 'directionGroup',
  initialState,
  reducers: {
    clearDirectionGroup: (state) => {
      state.directionGroups = null
      state.error = null
    },
    resetDirectionGroupState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDirectionGroupWithReplacement.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDirectionGroupWithReplacement.fulfilled, (state, action) => {
        state.loading = false
        state.directionGroups = action.payload
      })
      .addCase(fetchDirectionGroupWithReplacement.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearDirectionGroup, resetDirectionGroupState } = directionGroupSlice.actions
export default directionGroupSlice.reducer
