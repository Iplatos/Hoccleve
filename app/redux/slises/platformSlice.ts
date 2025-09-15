// slices/platformSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: null,
    refreshToken: null,
    baseUrl: null,
    authenticated: false,
    availablePlatforms: [],
};

const platformSlice = createSlice({
    name: 'platform',
    initialState,
    reducers: {
        setAuthState(state, action) {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.baseUrl = action.payload.baseUrl;
            state.authenticated = action.payload.authenticated;
        },
        setToken(state, action) {
            state.token = action.payload;
        },
        setAvailablePlatforms(state, action) {
            state.availablePlatforms = action.payload;
        },
    },
});

export const {setToken, setAuthState, setAvailablePlatforms } = platformSlice.actions;
export default platformSlice.reducer;
