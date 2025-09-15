import {fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import type {BaseQueryFn, FetchArgs, FetchBaseQueryError,} from '@reduxjs/toolkit/query'
import {Mutex} from 'async-mutex'
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_URL, TOKEN_KEY} from "../context/AuthContext.tsx";
import axios from "axios";
import {RootState} from "../redux/store/store.ts";

// const dynamicBaseQuery = fetchBaseQuery({
//     baseUrl: '',
//     prepareHeaders: (headers, { getState }) => {
//         const token = getState().auth.token;
//         if (token) {
//             headers.set('Authorization', `Bearer ${token}`);
//         }
//         return headers;
//     },
//     fetchFn: async (url, options, baseQueryApi) => {
//         const state = baseQueryApi.getState();
//         const baseUrl = state.auth.baseUrl || '';
//         const newUrl = `${baseUrl}${url}`;
//         return fetch(newUrl, options);
//     }
// });


// create a new mutex
const mutex = new Mutex()
const baseQuery = fetchBaseQuery(
    {
        baseUrl: 'https://api.lk-impulse.ru/v1',
        credentials: 'include',

        // работа с токеном
        prepareHeaders: async (headers) => {
            const token = await AsyncStorage.getItem(TOKEN_KEY).then(res => {
                const cleanedToken = res.replace(/^"(.*)"$/, '$1')

                if (res) {
                  //  console.log('cleanedToken', cleanedToken)
                    headers.set('Authorization', `Bearer ${cleanedToken}`)
                }
                })
            // console.log('baseURL', axios.defaults.baseURL)
            //  console.log('token', token)
            //   if (token) {
            //       headers.set('Authorization', `Bearer ${token}`)
            //   }
            return headers
        }
    })

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    //   console.log({args, api, extraOptions}, 'args, api, extraOptions')
    // wait until the mutex is available without locking it
    await mutex.waitForUnlock()
    let result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401) {
        // checking whether the mutex is locked
        if (!mutex.isLocked()) {
            const release = await mutex.acquire()
            try {
                await baseQuery(
                    {
                        method: 'POST',
                        url: '/auth/refresh-token'
                    },
                    api,
                    extraOptions
                )

                result = await baseQuery(args, api, extraOptions)

            } finally {
                // release must be called once the mutex should be released again.
                release()
            }
        } else {
            // wait until the mutex is available without locking it
            await mutex.waitForUnlock()
            result = await baseQuery(args, api, extraOptions)
        }
    }
    return result
}
