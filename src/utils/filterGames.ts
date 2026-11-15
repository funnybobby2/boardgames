import { Game } from "../types/Game"
import { Filters } from "../store/useGameStore"

// nbUsers filter values: 1 = solo, 2 = duel, 3 = multi (3+), 4 = all
function matchesPlayers(game: Game, nbUsers: number): boolean {
  switch (nbUsers) {
    case 1: return game.nbUserMin === 1
    case 2: return game.nbUserMin <= 2 && game.nbUserMax >= 2
    case 3: return game.nbUserMax >= 3
    default: return true
  }
}

/** Lowercase and strip accents so "dé" matches "De" and vice versa. */
export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

/** Every word of the query must appear in the title, group or one of the categories. */
function matchesQuery(game: Game, words: string[]): boolean {
  if (words.length === 0) return true
  const haystack = normalize([game.title, game.group, ...(game.category ?? [])].join(" "))
  return words.every(word => haystack.includes(word))
}

const byGroupThenTitle = (a: Game, b: Game) =>
  (a.group + a.title).localeCompare(b.group + b.title)

export function filterGames(games: Game[], filters: Filters): Game[] {
  const { query, isPlayed, nbUsers, ageMin, duration, forSale, isSorted, categories } = filters
  const words = normalize(query).split(/\s+/).filter(Boolean)

  // filter() returns a new array, so sorting it afterwards never mutates `games`
  const result = games.filter(game =>
    matchesQuery(game, words) &&
    (isPlayed === undefined || game.isPlayed === isPlayed) &&
    matchesPlayers(game, nbUsers) &&
    (!ageMin || game.ageMin <= ageMin) &&
    (!duration || game.duration <= duration) &&
    (forSale === undefined || game.forSale === forSale) &&
    categories.every(c => game.category?.includes(c))
  )

  if (isSorted === undefined) return result.sort(byGroupThenTitle)

  return result.sort((a, b) =>
    a.note === b.note
      ? byGroupThenTitle(a, b)
      : isSorted ? b.note - a.note : a.note - b.note
  )
}
