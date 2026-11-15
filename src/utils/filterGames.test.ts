import { describe, expect, it } from "vitest"
import { filterGames, normalize } from "./filterGames"
import { defaultFilters, Filters } from "../store/filters"
import { Game } from "../types/Game"

const game = (overrides: Partial<Game>): Game => ({
  id: 0,
  title: "",
  group: "",
  nbUserMin: 1,
  nbUserMax: 4,
  duration: 30,
  ageMin: 8,
  isPlayed: false,
  category: [],
  resume: "",
  ruleVideoUrl: "",
  img: "",
  note: 0,
  isExtension: false,
  forSale: false,
  ...overrides,
})

const games: Game[] = [
  game({ id: 1, title: "La Cabane abandonnée", group: "Exit", category: ["Escape game", "Coopératif"], nbUserMin: 1, nbUserMax: 4, duration: 60, ageMin: 12, note: 8, isPlayed: true }),
  game({ id: 2, title: "Patchwork", category: ["Puzzle"], nbUserMin: 2, nbUserMax: 2, duration: 30, ageMin: 8, note: 9 }),
  game({ id: 3, title: "Onirim", category: ["Coopératif"], nbUserMin: 1, nbUserMax: 1, duration: 15, ageMin: 10, note: 6, forSale: true }),
  game({ id: 4, title: "Codenames", category: ["Ambiance"], nbUserMin: 4, nbUserMax: 8, duration: 15, ageMin: 5, note: 8 }),
]

const run = (filters: Partial<Filters>) =>
  filterGames(games, { ...defaultFilters, ...filters }).map(g => g.id)

describe("normalize", () => {
  it("strips accents and lowercases", () => {
    expect(normalize("Abandonnée ÉTÉ")).toBe("abandonnee ete")
  })
})

describe("filterGames", () => {
  it("returns every game sorted by group then title by default", () => {
    // sort key is group + title: "Codenames" < "ExitLa Cabane..." < "Onirim" < "Patchwork"
    expect(run({})).toEqual([4, 1, 3, 2])
  })

  it("searches title, group and categories, ignoring accents and case", () => {
    expect(run({ query: "ABANDONNEE" })).toEqual([1])
    expect(run({ query: "exit" })).toEqual([1])
    expect(run({ query: "cooperatif" })).toEqual([1, 3])
  })

  it("requires every word of the query to match", () => {
    expect(run({ query: "exit cabane" })).toEqual([1])
    expect(run({ query: "exit patchwork" })).toEqual([])
  })

  it("filters by player count (solo / duel / multi)", () => {
    expect(run({ nbUsers: 1 })).toEqual([1, 3])
    expect(run({ nbUsers: 2 })).toEqual([1, 2])
    expect(run({ nbUsers: 3 })).toEqual([4, 1])
  })

  it("filters by max duration and min age", () => {
    expect(run({ duration: 15 })).toEqual([4, 3])
    expect(run({ ageMin: 8 })).toEqual([4, 2])
  })

  it("filters by played and for-sale status", () => {
    expect(run({ isPlayed: true })).toEqual([1])
    expect(run({ isPlayed: false })).toEqual([4, 3, 2])
    expect(run({ forSale: true })).toEqual([3])
  })

  it("requires every selected category", () => {
    expect(run({ categories: ["Coopératif"] })).toEqual([1, 3])
    expect(run({ categories: ["Coopératif", "Escape game"] })).toEqual([1])
  })

  it("sorts by note, ties broken by group then title", () => {
    expect(run({ isSorted: true })).toEqual([2, 4, 1, 3])
    expect(run({ isSorted: false })).toEqual([3, 4, 1, 2])
  })

  it("does not mutate the input array", () => {
    const copy = [...games]
    filterGames(games, { ...defaultFilters, isSorted: true })
    expect(games).toEqual(copy)
  })
})
