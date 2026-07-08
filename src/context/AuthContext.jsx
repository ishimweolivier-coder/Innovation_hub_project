import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = api.getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api.getMe()
      .then(setUser)
      .catch(() => api.setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const data = await api.login(email, password)
      if (data.requiresOtp) {
        return {
          success: true,
          requiresOtp: true,
          email: data.email,
          message: data.message,
          expiresInMinutes: data.expiresInMinutes,
        }
      }
      api.setToken(data.token)
      setUser(data.user)
      return { success: true, role: data.user.role, name: data.user.fullName }
    } catch (err) {
      return { success: false, error: err.message || 'Invalid credentials' }
    }
  }, [])

  const verifyAdminOtp = useCallback(async (email, otp) => {
    try {
      const { token, user: loggedInUser } = await api.verifyAdminOtp(email, otp)
      api.setToken(token)
      setUser(loggedInUser)
      return { success: true, role: loggedInUser.role, name: loggedInUser.fullName }
    } catch (err) {
      return { success: false, error: err.message || 'Invalid verification code' }
    }
  }, [])

  const resendAdminOtp = useCallback(async (email) => {
    try {
      const data = await api.resendAdminOtp(email)
      return { success: true, message: data.message }
    } catch (err) {
      return { success: false, error: err.message || 'Could not resend code' }
    }
  }, [])

  const logout = useCallback(() => {
    api.setToken(null)
    setUser(null)
  }, [])

  const register = useCallback(async (userData) => {
    try {
      const registerFn = userData.role === 'investor'
        ? api.registerInvestor
        : api.registerEntrepreneur

      const { token, user: newUser } = await registerFn({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        company: userData.company,
        investorType: userData.investorType,
      })

      api.setToken(token)
      setUser(newUser)
      return { success: true, name: newUser.fullName }
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' }
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, verifyAdminOtp, resendAdminOtp, logout, register, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
