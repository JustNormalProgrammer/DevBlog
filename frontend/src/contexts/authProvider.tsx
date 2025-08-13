import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import axios from 'axios'
import api from '../utils/axios'
import type { LoginInputs, User } from '@/types'

export interface AuthContext {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  refresh: () => Promise<string | null>
  login: (data: LoginInputs) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [{ user, token, isAuthenticated }, setState] = useState<{
    user: User | null
    isAuthenticated: boolean
    token: string | null
  }>({ user: null, isAuthenticated: false, token: null })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const accessToken = await refresh()
      console.log('AccessToken:', accessToken)
      if (accessToken) {
        try {
          const {
            data: { username, isAdmin },
          } = await api.get<User>('/users/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
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
          console.log('Auth complete')
        } catch (e) {
          console.log(e)
        } finally {
          setIsLoading(false)
        }
      }
      setIsLoading(false)
    }
    fetchUser()
  }, [])
  // error handling
  const login = useCallback(async (data: LoginInputs) => {
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
      {isLoading ? null : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error('useAuth is being called outside of AuthProvider')
  return context
}
