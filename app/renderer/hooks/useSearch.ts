import { useState, useEffect, useRef } from 'react'
import type { Patient } from '../../shared/types/patient'
import { patientService } from '../services/patientService'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await patientService.search(query)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const clear = () => {
    setQuery('')
    setResults([])
  }

  return { query, setQuery, results, loading, clear }
}
