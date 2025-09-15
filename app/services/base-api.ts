import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {baseQueryWithReauth} from "./base-query-with-reauth";
import axios from "axios";


export const baseApi = createApi({
    // baseQuery: baseQueryWithReauth,
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://api.lk-impulse.ru:8803/v1',
        prepareHeaders: headers => {

            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json');
            }

            return headers;
        },
    }),
    endpoints: () => ({}),
    reducerPath: 'baseApi',

});
