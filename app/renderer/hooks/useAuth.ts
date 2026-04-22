import { useState } from 'react'
import { authService } from '../services/authService'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (password: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const result = await authService.login(password)
      if (!result.success) {
        setError('Incorrect password. Please try again.')
        return false
      }
      return true
    } catch {
      setError('An error occurred. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    try {
      return await authService.changePassword(oldPass, newPass)
    } finally {
      setLoading(false)
    }
  }

  return { login, changePassword, loading, error, clearError: () => setError(null) }
}
