import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axiosInstance from "../../../services/axios/axiosConfig.ts";
import axios from "axios"; // путь тоже поправь если нужно

export interface DirectionTariff {
    id: number;
    direction_id: number;
    name: string;
    description: string;
    gpa: number;
    first_price: string | null;
    second_price: string | null;
    third_price: string | null;
    type: string;
    old_price: string | null;
    attached_groups: number;
    isAttached_groups: number;
    visibility_cources: number;
    any_seminarian: boolean;
    currency: string;
    has_paid_cancel: number;
    paid_cancel_student: number;
    paid_cancel_teacher: number;
    view: number;
    direct_link_enabled: number;
    is_used: boolean;
}

export interface Direction {
    id: number;
    name: string;
    short_name: string;
    description: string;
    icon_path: string;
    created_at: number;
    updated_at: number;
    code: string | null;
    start_price: string;
    use_promo_code: number;
    use_discount: number;
    filter_id: number;
    seminarian_id: number | null;
    permission_add_child: number;
    view: number;
    old_price: string;
    sorting: number | null;
    flag_easily_creating: number;
    flag_one_block: number;
    icon_media_id: number | null;
    sub_folder_id: number | null;
    flag_allow_certificate: number;
    certificate_unlock_percentage: number;
    has_demo: number;
    duration_in_months: number | null;
    media_icon_id: number | null;
    certificate_template_id: number | null;
    directionTariffs: DirectionTariff[];
}

export interface DirectionBySeminarian {
    direction_id: number;
    seminarian_id: number;
    id: number;
    rate: number;
    rate_group: number;
    direction: Direction;
}

interface DirectionsBySeminarianState {
    data: DirectionBySeminarian[];
    isLoading: boolean;
    error: string | null;
}

const initialState: DirectionsBySeminarianState = {
    data: [],
    isLoading: false,
    error: null,
};

export const fetchDirectionsBySeminarian = createAsyncThunk<
    DirectionBySeminarian[], // что возвращаем
    number, // что передаём (seminarianId)
    { rejectValue: string } // ошибка
>(
    'seminarian/fetchDirectionsBySeminarian',
    async (seminarianId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get<{ data: DirectionBySeminarian[] }>(
                `/v1/user/directions-by-seminarian`,
                {
                    params: {
                        seminarianId,
                        expand: 'direction.directionTariffs',
                    },
                }
            );

            return response.data.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(err.response.data.message || 'Ошибка запроса');
            }
            return rejectWithValue('Ошибка запроса');
        }
    }
);


const directionsBySeminarianSlice = createSlice({
    name: 'directionsBySeminarian',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDirectionsBySeminarian.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDirectionsBySeminarian.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchDirectionsBySeminarian.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Ошибка при загрузке направлений';
            });
    },
});

export default directionsBySeminarianSlice.reducer;