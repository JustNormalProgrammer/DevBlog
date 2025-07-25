import React, { createContext, useContext, useEffect, useState } from 'react'
import getAnonUsername from '@/utils/getAnonUsername'

const AuthContext = createContext<{
  token: string
  setToken: React.Dispatch<React.SetStateAction<string>>
} | null>(null)

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [token, setToken] = useState('')

  useEffect(() => {
    getAnonUsername()
  }, [])

  return (
    <AuthContext.Provider value={{token, setToken}}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) 
    throw new Error('useAuth is being called outside of AuthProvider')
  return context
}
