import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defaultFilters, Filters, readFiltersFromUrl, writeFiltersToUrl } from "./filters"

// Minimal window stub: just enough location/history for the URL helpers
let url: URL
beforeEach(() => {
  url = new URL("https://example.test/boardgames/")
  vi.stubGlobal("window", {
    get location() { return url },
    history: { state: null, replaceState: (_s: unknown, _t: string, u: string) => { url = new URL(u, url) } },
  })
})
afterEach(() => vi.unstubAllGlobals())

const setSearch = (search: string) => { url = new URL(`https://example.test/boardgames/${search}`) }

describe("readFiltersFromUrl", () => {
  it("returns defaults for an empty URL", () => {
    expect(readFiltersFromUrl()).toEqual(defaultFilters)
  })

  it("ignores invalid values", () => {
    setSearch("?players=9&duration=17&age=abc&sort=up&played=yes&cat=")
    expect(readFiltersFromUrl()).toEqual(defaultFilters)
  })
})

describe("writeFiltersToUrl", () => {
  it("writes nothing for default filters", () => {
    writeFiltersToUrl(defaultFilters)
    expect(url.search).toBe("")
    expect(url.pathname).toBe("/boardgames/")
  })

  it("round-trips every filter, including accents and commas", () => {
    const filters: Filters = {
      query: "dé à 6",
      isPlayed: false,
      nbUsers: 2,
      duration: 45,
      ageMin: 8,
      isSorted: true,
      forSale: true,
      categories: ["Coopératif", "Enquête, déduction"],
    }
    writeFiltersToUrl(filters)
    expect(readFiltersFromUrl()).toEqual(filters)
  })

  it("keeps the hash", () => {
    url = new URL("https://example.test/boardgames/#top")
    writeFiltersToUrl({ ...defaultFilters, query: "exit" })
    expect(url.hash).toBe("#top")
    expect(url.searchParams.get("q")).toBe("exit")
  })
})
