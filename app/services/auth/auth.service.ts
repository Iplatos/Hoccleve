import {
    LoginArgs,
    LoginResponse,
} from './auth.types.ts';
import {baseApi} from "../base-api";

export const authService = baseApi.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation<LoginResponse, LoginArgs>({
            query: body => ({
                body,
                method: 'POST',
                url: '/auth/login/',
                params: {
                    expand: 'roles'
                }
            }),
            // invalidatesTags: ['user'],
        }),
    }),
});

export const {
    useLoginMutation
} = authService;
