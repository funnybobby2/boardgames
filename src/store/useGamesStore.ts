import { create } from "zustand"
import { supabase } from "../lib/supabase"
import { Game } from "../types/Game"

type GamesStore = {
  games: Game[]
  isLoaded: boolean
  loadGames: () => Promise<void>
  updateGame: (id: number, patch: Partial<Pick<Game, "note" | "isPlayed">>) => void
  addGame: (game: Game) => Promise<string | null>
  editGame: (game: Game) => Promise<string | null>
}

const toGame = (row: Record<string, unknown>): Game => ({
  id: row.id as number,
  title: row.title as string,
  group: row.group as string,
  nbUserMin: row.nb_user_min as number,
  nbUserMax: row.nb_user_max as number,
  duration: row.duration as number,
  ageMin: row.age_min as number,
  isPlayed: row.is_played as boolean,
  category: row.category as string[],
  resume: row.resume as string,
  ruleVideoUrl: row.rule_video_url as string,
  img: row.img as string,
  note: row.note as number,
  isExtension: row.is_extension as boolean,
})

export const useGamesStore = create<GamesStore>((set) => ({
  games: [],
  isLoaded: false,

  loadGames: async () => {
    const { data } = await supabase.from("games").select("*")
    if (!data) { set({ isLoaded: true }); return }
    set({ games: data.map(toGame), isLoaded: true })
  },

  updateGame: (id, patch) => {
    set(state => ({
      games: state.games.map(g => g.id === id ? { ...g, ...patch } : g)
    }))
    const dbPatch: Record<string, unknown> = {}
    if (patch.note !== undefined) dbPatch.note = patch.note
    if (patch.isPlayed !== undefined) dbPatch.is_played = patch.isPlayed
    supabase.from("games").update(dbPatch).eq("id", id).then()
  },

  addGame: async (game) => {
    const { error } = await supabase.from("games").insert({
      id: game.id,
      title: game.title,
      group: game.group,
      nb_user_min: game.nbUserMin,
      nb_user_max: game.nbUserMax,
      duration: game.duration,
      age_min: game.ageMin,
      is_played: game.isPlayed,
      category: game.category,
      resume: game.resume,
      rule_video_url: game.ruleVideoUrl,
      img: game.img,
      note: game.note,
      is_extension: game.isExtension,
    })
    if (error) return error.message
    set(state => ({ games: [...state.games, game] }))
    return null
  },

  editGame: async (game) => {
    const { error } = await supabase.from("games").update({
      title: game.title,
      group: game.group,
      nb_user_min: game.nbUserMin,
      nb_user_max: game.nbUserMax,
      duration: game.duration,
      age_min: game.ageMin,
      is_played: game.isPlayed,
      category: game.category,
      resume: game.resume,
      rule_video_url: game.ruleVideoUrl,
      img: game.img,
      note: game.note,
      is_extension: game.isExtension,
    }).eq("id", game.id)
    if (error) return error.message
    set(state => ({ games: state.games.map(g => g.id === game.id ? game : g) }))
    return null
  },
}))
