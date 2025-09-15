import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axiosInstance from '../services/axios/instans.ts'

interface AuthProps {
  loading?: boolean
  authState?: { token: string | null; authenticated: boolean | null; userId: number | null }
  onLogin?: (email: string, password: string) => Promise<any>
  onLogout?: () => Promise<any>
}

export const TOKEN_KEY = 'my-jwt'
export const REFRESH_TOKEN_KEY = 'my-refresh-jwt'
export const USER_ID = 'user-id'

// УДАЛЯЕМ API_URL и API_URL_NAME - они больше не нужны

const AuthContext = createContext<AuthProps>({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<{
    token: string | null
    userId: number | null
    authenticated: boolean | null
  }>({
    token: null,
    userId: null,
    authenticated: false,
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY)
      const userIdStr = await AsyncStorage.getItem(USER_ID)

      if (token) {
        const cleanedToken = token.replace(/^"(.*)"$/, '$1')
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${cleanedToken}`

        const userId = userIdStr ? parseInt(userIdStr, 10) : null

        setAuthState({
          token: cleanedToken,
          authenticated: true,
          userId: userId,
        })
      }
    }
    loadToken()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // ПРЯМОЙ ЗАПРОС НА ФИКСИРОВАННЫЙ URL (база URL уже в axiosConfig)
      const result = await axiosInstance.post('/v1/auth/login/?expand=roles', {
        email,
        password,
      })

      if (result.data.token) {
        const { token, refresh_token, user } = result.data

        await AsyncStorage.setItem(TOKEN_KEY, token)
        await AsyncStorage.setItem(USER_ID, user.id.toString())
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(refresh_token))

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`

        setAuthState({
          token: token,
          authenticated: true,
          userId: user.id,
        })

        setLoading(false)
        return { success: true, data: result.data }
      }
    } catch (error: any) {
      setLoading(false)
      const errorMessage =
        error.response?.data?.error?.[0]?.password ||
        error.response?.data?.message ||
        'Ошибка авторизации'
      return { error: true, msg: errorMessage }
    }

    setLoading(false)
    return { error: true, msg: 'Неизвестная ошибка' }
  }

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY)
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
    await AsyncStorage.removeItem(USER_ID)

    setAuthState({
      token: null,
      authenticated: false,
      userId: null,
    })
  }

  const value = {
    onLogin: login,
    onLogout: logout,
    authState,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
