import {baseApi} from "../base-api";
import {UserArgs} from "./user.types.ts";

export const authService = baseApi.injectEndpoints({
    endpoints: builder => ({
        getUser: builder.query<any, UserArgs>({
            query: (id) => {
                return {
                    method: 'GET',
                    url: '/user/view/6?expand=roles',
                    // params: {
                    //     id: id,
                    //     "expand": 'roles'
                    // },
                }

            },
        }),
        getAll: builder.query<void, void>({
            query: () => {
                return {
                    method: 'GET',
                    url: '/setting/get-all',
                    // params: {
                    //     id: id,
                    //     "expand": 'roles'
                    // },
                }

            },
        }),
    }),
});

export const {
    useGetUserQuery,
    useLazyGetAllQuery
} = authService;
