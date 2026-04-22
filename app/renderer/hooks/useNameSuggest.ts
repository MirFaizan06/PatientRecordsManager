import { useState, useEffect, useRef } from 'react'
import type { Patient } from '../../shared/types/patient'
import { patientService } from '../services/patientService'

const MIN_CHARS = 3
const DEBOUNCE_MS = 180
const LIMIT = 10

export function useNameSuggest(query: string, enabled: boolean) {
  const [suggestions, setSuggestions] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [noResults, setNoResults] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)

    if (!enabled || query.trim().length < MIN_CHARS) {
      setSuggestions([])
      setLoading(false)
      setNoResults(false)
      return
    }

    setLoading(true)
    setNoResults(false)

    timer.current = setTimeout(async () => {
      try {
        const data = await patientService.suggestByName(query.trim(), LIMIT)
        setSuggestions(data)
        setNoResults(data.length === 0)
      } catch {
        setSuggestions([])
        setNoResults(false)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [query, enabled])

  const reset = () => {
    setSuggestions([])
    setNoResults(false)
    setLoading(false)
  }

  return { suggestions, loading, noResults, reset }
}
