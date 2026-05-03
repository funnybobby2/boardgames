import { Game } from "../types/Game"

export function filterGames(games: Game[], filters: any) {

  let result = [...games]

  if (filters.query) {
    result = result.filter(game =>
      game.title.toLowerCase().includes(filters.query.toLowerCase())
    )
  }

  if (filters.isPlayed !== undefined) {
    result = result.filter(game => game.isPlayed === filters.isPlayed)
  }

  if(filters.nbUsers) {
    result = result.filter(g => {
        if(filters.nbUsers === 4) return true;
        if(filters.nbUsers === 1){
          return g.nbUserMin === 1;
        }
        if(filters.nbUsers === 2){
          return g.nbUserMin <= 2 && g.nbUserMax >= 2;
        }
        return g.nbUserMax >= 3;
      });
  }

  if (filters.ageMin) {
    result = result.filter(game => game.ageMin <= filters.ageMin)
  }

  if (filters.duration) {
    result = result.filter(game => game.duration <= filters.duration)
  }

  if (filters.isSorted !== undefined) {
    result = result.sort((a, b) => {
        if (a.note === b.note) {
          return (a.group + a.title).localeCompare(b.group + b.title)
        }
      return filters.isSorted ? b.note - a.note : a.note - b.note;
    })
  } else {
    result = result.sort((a, b) => (a.group + a.title).localeCompare(b.group + b.title))
  }

  return result
}