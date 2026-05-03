import { create } from "zustand"

type Filters = {
  isPlayed?: boolean
  nbUsers: number
  duration?: number
  ageMin?: number
  query: string
  isSorted?: boolean
}

type GameStore = {

  filters: Filters

  total: number
  filteredTotal: number
  isVideoPlayed: boolean

  toggleIsPlayed: () => void
  cycleUsers: () => void
  cycleDuration: () => void
  cycleAge: () => void
  toggleSort: () => void
  setQuery: (q: string) => void

  setTotal: (n: number) => void
  setFilteredTotal: (n: number) => void
  toggleVideo: () => void
}

const durationSteps = [15,30,45,60,90]
const ageSteps = [5,8,12,16]

export const useGameStore = create<GameStore>((set, get) => ({

  filters: {
    isPlayed: undefined,
    nbUsers: 4,
    duration: undefined,
    ageMin: undefined,
    query: "",
    isSorted: undefined
  },

  total: 0,
  filteredTotal: 0,
  isVideoPlayed: false,

  toggleIsPlayed: () => {
    const prev = get().filters.isPlayed

    set(state => ({
      filters: {
        ...state.filters,
        isPlayed: prev === undefined ? true : prev ? false : undefined
      }
    }))
  },

  cycleUsers: () =>
    set(state => ({
      filters: {
        ...state.filters,
        nbUsers: state.filters.nbUsers === 4 ? 1 : state.filters.nbUsers + 1
      }
    })),

  cycleDuration: () => {

    const prev = get().filters.duration

    if(prev === undefined)
      return set(state => ({
        filters: {...state.filters, duration: durationSteps[0]}
      }))

    const i = durationSteps.indexOf(prev)

    set(state => ({
      filters: {
        ...state.filters,
        duration: durationSteps[i+1] ?? undefined
      }
    }))
  },

  cycleAge: () => {

    const prev = get().filters.ageMin

    if(prev === undefined)
      return set(state => ({
        filters: {...state.filters, ageMin: ageSteps[0]}
      }))

    const i = ageSteps.indexOf(prev)

    set(state => ({
      filters: {
        ...state.filters,
        ageMin: ageSteps[i+1] ?? undefined
      }
    }))
  },

  toggleSort: () => {

    const prev = get().filters.isSorted

    set(state => ({
      filters: {
        ...state.filters,
        isSorted: prev === undefined ? true : prev ? false : undefined
      }
    }))
  },

  setQuery: (query) =>
    set(state => ({
      filters: {...state.filters, query}
    })),

  setTotal: (n) => set({ total: n }),

  setFilteredTotal: (n) => set({ filteredTotal: n }),

  toggleVideo: () =>
    set(state => ({ isVideoPlayed: !state.isVideoPlayed }))

}))