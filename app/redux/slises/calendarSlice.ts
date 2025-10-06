import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import axiosInstance from '../../services/axios/axiosConfig.ts'

interface Report {
  id: number
  event_id: number
  status: number
  comment: string
  date_conference: string
  created_at: number
  updated_at: number
}

interface Child {
  id: number
  custom_id: string | null
  email: string
  phone: string
  name: string
  avatar_path: string
  promo_code: string
  created_at: number
  updated_at: number
  reportParents: any[] // замените на соответствующий тип если необходимо
}

export interface Direction {
  id: number
  name: string
  short_name: string
  description: string
  icon_path: string
  created_at: number
  updated_at: number
  code: string | null
  start_price: string
  use_promo_code: number
  use_discount: number
  filter_id: number
  seminarian_id: number | null
  permission_add_child: number
  view: number
  old_price: string
  sorting: number | null
  flag_easily_creating: number
}

interface Group {
  id: number
  direction_id: number
  teacher_id: number
  name: string
  created_at: number
  any_seminarian: 0
  updated_at: number
}

export interface TimetableEvent {
  audience_number: number | null
  directionName: string
  author_id: number
  children: any | null
  deny_access: boolean
  children_id: any | null
  conference_type: string
  created_at: number
  date_conference: string
  direction: Direction
  direction_course_id: any | null
  direction_id: number
  duration: number
  editor_id: number
  end_date: string | null
  end_time: string
  event_id: number | null
  events: any[]
  group: Group
  group_id: number
  id: number
  interval_type: string
  is_cancel: number
  is_choose_material: number
  is_offline: number
  lesson_type: any | null
  link_to_meeting: string
  material: any | null
  material_comment: any | null
  material_id: any | null
  name: any | null
  repeat_day: any | null
  reports: Report[]
  speaker_id: number
  start_date: any | null
  start_time: string
  topic_lesson_id: any | null
  updated_at: number
}

interface TimetableState {
  data: TimetableEvent[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: TimetableState = {
  data: [],
  status: 'idle',
  error: null,
}

export const fetchCalendar = createAsyncThunk<
  TimetableEvent[],
  { start: string; end: string; type?: string; filters?: any },
  { rejectValue: string }
>('timetable/fetchTimetable', async ({ start, end, type = 'my', filters }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`/v1/timetable-beta/get-weekly-timetable-data`, {
      start,
      end,
      type,
      filters,
    })

    // backend возвращает массив дней с reports
    const days = response.data.data || []

    // собираем все reports в один массив
    const events: TimetableEvent[] = days.flatMap((day: any) =>
      (day.reports || []).map((report: any) => ({
        ...report,
        date_conference: day.date, // дата дня
      }))
    )

    return events
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return rejectWithValue(err.response.data.message || 'Ошибка запроса')
    }
    return rejectWithValue('Ошибка запроса')
  }
})

// export const fetchCalendar = createAsyncThunk<
//     TimetableEvent[],
//     string,
//     { rejectValue: string }
// >('timetable/fetchTimetable', async (date, { rejectWithValue }) => {
//     try {
//         const response = await axiosInstance.get(`/v1/timetable/children-own?expand=unavailableEvents,timetableEnrollments,group.students,direction,material.course.direction,reports,events,children,notes,seminarianLesson.user&date=${date}`);
//
//         const uniqueEvents = response.data.data.reduce((acc: TimetableEvent[], current: TimetableEvent) => {
//             const existingEvent = acc.find(event => event.id === current.id);
//             if (!existingEvent) {
//                 acc.push(current);
//             }
//             return acc;
//         }, []);
//
//         return uniqueEvents;
//     } catch (err) {
//         if (axios.isAxiosError(err) && err.response) {
//             return rejectWithValue(err.response.data.message || 'Ошибка запроса');
//         }
//         return rejectWithValue('Ошибка запроса');
//     }
// });

export const fetchCalendarBySeminarian = createAsyncThunk<
  TimetableEvent[],
  { date: string; speaker_id: number },
  { rejectValue: string }
>('timetable/fetchTimetableBySeminarian', async ({ date, speaker_id }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(
      `/v1/timetable?expand=unavailableEvents,timetableEnrollments,group.students,direction,material.course.direction,reports,events,children,notes,seminarianLesson.user&date=${date}&speaker_id=${speaker_id}`
    )

    const uniqueEvents = response.data.data.reduce(
      (acc: TimetableEvent[], current: TimetableEvent) => {
        const existingEvent = acc.find((event) => event.id === current.id)
        if (!existingEvent) {
          acc.push(current)
        }
        return acc
      },
      []
    )

    return uniqueEvents
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return rejectWithValue(err.response.data.message || 'Ошибка запроса')
    }
    return rejectWithValue('Ошибка запроса')
  }
})

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendar.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCalendar.fulfilled, (state, action: PayloadAction<TimetableEvent[]>) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
      .addCase(fetchCalendarBySeminarian.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(
        fetchCalendarBySeminarian.fulfilled,
        (state, action: PayloadAction<TimetableEvent[]>) => {
          state.status = 'succeeded'
          state.data = action.payload
        }
      )
      .addCase(fetchCalendarBySeminarian.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  },
})

export default calendarSlice.reducer
