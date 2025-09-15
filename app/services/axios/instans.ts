import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL_NAME, REFRESH_TOKEN_KEY, TOKEN_KEY } from '../../context/AuthContext.tsx'
import axiosInstance from './axiosConfig.ts'

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem(TOKEN_KEY)
    // const origin = await AsyncStorage.getItem(API_URL_NAME);
    // if (origin) {
    //     config.headers['Origin'] = origin;
    // }
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken.replace(/^"(.*)"$/, '$1')}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response, // Возвращаем успешные ответы напрямую.
  async (error) => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // Помечаем запрос как повторный, чтобы избежать бесконечных циклов.
      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY)
        const role = await AsyncStorage.getItem('USER_ROLE')
        if (!refreshToken) {
          return Promise.reject(error) // Обработка случая, когда refresh token отсутствует.
        }
        //  console.log('axiosInstance', refreshToken.replace(/^"(.*)"$/, '$1'))

        const response = await axiosInstance.post('/v1/auth/refresh-token', {
          refresh_token: refreshToken.replace(/^"(.*)"$/, '$1'),
          role: role,
        })

        const { token } = response.data

        // Сохраняем новые токены.
        await AsyncStorage.setItem(TOKEN_KEY, token)
        //   console.log('новый токен c запроса', token)

        // Обновляем заголовок авторизации с новым access token.
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.replace(
          /^"(.*)"$/,
          '$1'
        )}`
        originalRequest.headers['Authorization'] = `Bearer ${token.replace(/^"(.*)"$/, '$1')}`

        // Повторяем исходный запрос с новым access token.
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Обработка ошибок обновления токена путем удаления хранимых токенов и перенаправления на страницу входа.
        //  await AsyncStorage.removeItem(TOKEN_KEY);
        //   await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error) // Для всех остальных ошибок возвращаем ошибку как есть.
  }
)

export default axiosInstance
