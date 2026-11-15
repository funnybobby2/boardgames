import { create } from "zustand"
import { Filters, durationSteps, ageSteps, readFiltersFromUrl, writeFiltersToUrl } from "./filters"

export type { Filters }

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
  toggleForSale: () => void
  toggleCategory: (category: string) => void
  clearCategories: () => void

  setTotal: (n: number) => void
  setFilteredTotal: (n: number) => void
  toggleVideo: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({

  // Initial filters come from the URL so shared links and reloads keep them
  filters: readFiltersFromUrl(),

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

  toggleForSale: () =>
    set(state => ({
      filters: {
        ...state.filters,
        forSale: state.filters.forSale === undefined ? true : undefined,
      }
    })),

  toggleCategory: (category) =>
    set(state => {
      const current = state.filters.categories
      return {
        filters: {
          ...state.filters,
          categories: current.includes(category)
            ? current.filter(c => c !== category)
            : [...current, category],
        }
      }
    }),

  clearCategories: () =>
    set(state => ({ filters: { ...state.filters, categories: [] } })),

  setTotal: (n) => set({ total: n }),

  setFilteredTotal: (n) => set({ filteredTotal: n }),

  toggleVideo: () =>
    set(state => ({ isVideoPlayed: !state.isVideoPlayed }))

}))
// Keep the URL in sync with the filters
useGameStore.subscribe((state, prev) => {
  if (state.filters !== prev.filters) writeFiltersToUrl(state.filters)
})
