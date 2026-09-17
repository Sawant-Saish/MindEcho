import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
  type AuthUser,
} from '../lib/api/auth.api'
import { useApi } from '../lib/api/client'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'memoroute_auth'
const TOKEN_KEY = 'memoroute_token'
const REFRESH_TOKEN_KEY = 'memoroute_refresh_token'

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function persistSession(response: { token: string; refreshToken: string; user: AuthUser }) {
  localStorage.setItem(TOKEN_KEY, response.token)
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser())
  const [isLoading, setIsLoading] = useState(useApi)

  useEffect(() => {
    if (!useApi) return

    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    fetchCurrentUser()
      .then((currentUser) => {
        setUser(currentUser)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser))
      })
      .catch(() => {
        clearSession()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!name.trim() || !email.trim() || !password.trim()) return false

    if (useApi) {
      try {
        const response = await registerRequest(name.trim(), email.trim(), password)
        persistSession(response)
        setUser(response.user)
        return true
      } catch {
        return false
      }
    }

    const nextUser: AuthUser = {
      id: `demo_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    return true
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) return false

    if (useApi) {
      try {
        const response = await loginRequest(email.trim(), password)
        persistSession(response)
        setUser(response.user)
        return true
      } catch {
        return false
      }
    }

    const nextUser: AuthUser = {
      id: `demo_${Date.now()}`,
      name: email.split('@')[0] || 'Learner',
      email: email.trim(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    return true
  }, [])

  const logout = useCallback(async () => {
    if (useApi) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (refreshToken) {
        try {
          await logoutRequest(refreshToken)
        } catch {
          // Clear local session even if API logout fails
        }
      }
    }

    clearSession()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
