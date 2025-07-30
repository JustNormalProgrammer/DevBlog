import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'
import axios from 'axios'
import api from '../utils/axios'
import type { LoginInputs, User } from '@/types'
import getAnonUsername from '@/utils/getAnonUsername'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'

const AuthContext = createContext<{
  user: User | null
  token: string | null
  isAuthenticated: boolean
  refresh: () => Promise<string | null>
  login: (data: LoginInputs) => Promise<void>
  logout: () => Promise<void>
} | null>(null)

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [{ user, token, isAuthenticated }, setState] = useState<{
    user: User | null
    isAuthenticated: boolean
    token: string | null
  }>({ user: null, isAuthenticated: false, token: null })

  useEffect(() => {
    getAnonUsername()
  }, [])

  useLayoutEffect(() => {
    console.log('useEffect:', token)
    const fetchUser = async () => {
      const accessToken = await refresh()
      console.log('AccessToken:', accessToken)
      if (!accessToken) return
      try {
        const {
          data: { username, isAdmin },
        } = await api.get<User>('/users/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        setState((prev) => {
          return {
            ...prev,
            user: {
              username,
              isAdmin,
            },
            isAuthenticated: true,
          }
        })
      } catch (e) {
        console.log(e)
      }
    }
    fetchUser()
  }, [])
  // error handling
  const login = useCallback(async (data: LoginInputs) => {
    try {
      const response = await api.post('/auth/login', data, {
        withCredentials: true,
      })
      setState({
        user: {
          username: response.data.username,
          isAdmin: response.data.isAdmin,
        },
        isAuthenticated: true,
        token: response.data.accessToken,
      })
    } catch (e) {
      setState({ user: null, isAuthenticated: false, token: null })
      throw e
    }
  }, [])
  // error handling
  const logout = useCallback(async () => {
    try {
      await api.get('/auth/logout', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        const newAccessToken = await refresh()
        await api.get('/auth/logout', {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        })
      }
      console.log(e)
    } finally {
      setState({ user: null, isAuthenticated: false, token: null })
    }
  }, [token])
  const refresh: () => Promise<string | null> = useCallback(async () => {
    try {
      const response = await api.get(
        `/auth/refresh-token?timestamp=${Date.now()}`,
        {
          withCredentials: true,
        },
      )
      setState((prev) => {
        return { ...prev, token: response.data.accessToken }
      })
      return response.data.accessToken
    } catch (e) {
      setState({ user: null, isAuthenticated: false, token: null })
      return null
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        refresh,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error('useAuth is being called outside of AuthProvider')
  return context
}
