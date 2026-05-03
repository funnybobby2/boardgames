import { useState, useCallback } from "react"

export function useGameFilters() {
  const [isPlayed, setIsPlayed] = useState<boolean | undefined>()
  const [nbUsers, setNbUsers] = useState<number>(4)
  const [duration, setDuration] = useState<number | undefined>()
  const [ageMin, setAgeMin] = useState<number | undefined>()
  const [query, setQuery] = useState("")
  const [isSorted, setIsSorted] = useState<boolean | undefined>()

  const durationSteps = [15, 30, 45, 60, 90]
  const ageSteps = [5, 8, 12, 16]

  const toggleIsPlayed = useCallback(() => {
    setIsPlayed(prev => prev === undefined ? true : prev ? false : undefined)
  }, [])

  const cycleUsers = useCallback(() => {
    setNbUsers(prev => (prev === 4 ? 1 : prev + 1))
  }, [])

  const cycleDuration = useCallback(() => {
    setDuration(prev => {
      if (prev === undefined) return durationSteps[0]
      const i = durationSteps.indexOf(prev)
      return durationSteps[i + 1] ?? undefined
    })
  }, [])

  const cycleAge = useCallback(() => {
    setAgeMin(prev => {
      if (prev === undefined) return ageSteps[0]
      const i = ageSteps.indexOf(prev)
      return ageSteps[i + 1] ?? undefined
    })
  }, [])

  const toggleSort = useCallback(() => {
    setIsSorted(prev => prev === undefined ? true : prev ? false : undefined)
  }, [])

  return {
    filters: {
      isPlayed,
      nbUsers,
      duration,
      ageMin,
      query,
      isSorted
    },

    actions: {
      toggleIsPlayed,
      cycleUsers,
      cycleDuration,
      cycleAge,
      toggleSort,
      setQuery
    }
  }
}