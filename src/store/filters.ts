export type Filters = {
  isPlayed?: boolean
  /** 1 = solo, 2 = duel, 3 = multi (3+), 4 = all */
  nbUsers: number
  duration?: number
  ageMin?: number
  query: string
  /** true = best rated first, false = worst rated first */
  isSorted?: boolean
  forSale?: boolean
  /** Games must have every selected category */
  categories: string[]
}

export const durationSteps = [15, 30, 45, 60, 90]
export const ageSteps = [5, 8, 12, 16]

export const defaultFilters: Filters = {
  isPlayed: undefined,
  nbUsers: 4,
  duration: undefined,
  ageMin: undefined,
  query: "",
  isSorted: undefined,
  forSale: undefined,
  categories: [],
}

/*
 * URL format (only non-default values are written):
 *   ?q=exit&played=1&players=2&duration=45&age=8&sort=desc&sale=1&cat=Coopératif&cat=Enquête
 */

const toBool = (v: string | null) => (v === "1" ? true : v === "0" ? false : undefined)
const fromBool = (v: boolean | undefined) => (v === undefined ? null : v ? "1" : "0")
const toStep = (v: string | null, steps: number[]) => {
  const n = Number(v)
  return v !== null && steps.includes(n) ? n : undefined
}

/** Reads filters from the current URL; invalid or missing values fall back to defaults. */
export function readFiltersFromUrl(): Filters {
  if (typeof window === "undefined") return defaultFilters
  const p = new URLSearchParams(window.location.search)
  const players = Number(p.get("players"))
  const sort = p.get("sort")

  return {
    query: p.get("q") ?? "",
    isPlayed: toBool(p.get("played")),
    nbUsers: [1, 2, 3].includes(players) ? players : 4,
    duration: toStep(p.get("duration"), durationSteps),
    ageMin: toStep(p.get("age"), ageSteps),
    isSorted: sort === "desc" ? true : sort === "asc" ? false : undefined,
    forSale: p.get("sale") === "1" ? true : undefined,
    categories: p.getAll("cat").filter(Boolean),
  }
}

/** Replaces the URL query string with the given filters (no new history entry). */
export function writeFiltersToUrl(filters: Filters): void {
  const p = new URLSearchParams()
  const setIf = (key: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined && value !== "") p.set(key, String(value))
  }

  setIf("q", filters.query.trim())
  setIf("played", fromBool(filters.isPlayed))
  if (filters.nbUsers !== 4) setIf("players", filters.nbUsers)
  setIf("duration", filters.duration)
  setIf("age", filters.ageMin)
  setIf("sort", filters.isSorted === undefined ? null : filters.isSorted ? "desc" : "asc")
  if (filters.forSale) setIf("sale", "1")
  filters.categories.forEach(c => p.append("cat", c))

  const search = p.toString()
  const url = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`
  window.history.replaceState(window.history.state, "", url)
}
