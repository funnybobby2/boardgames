import "./App.css"

import { useState, useMemo, useCallback, Suspense, lazy, useEffect } from "react"
import { Snackbar, Alert } from "@mui/material"

import Topbar from "./components/Topbar/Topbar"
import Content from "./components/Content/Content"
import Disclaimer from "./components/Disclaimer/Disclaimer"

import { Game } from "./types/Game"
import { useGameStore } from "./store/useGameStore"
import { useGamesStore } from "./store/useGamesStore"
import { useAuthStore } from "./store/useAuthStore"
import { supabase } from "./lib/supabase"
import { hasRuleVideo } from "./utils/video"

const VideoPlayer = lazy(() => import("./components/VideoPlayer/VideoPlayer"))

function App() {

  const loadGames = useGamesStore(state => state.loadGames)
  useEffect(() => { loadGames() }, [loadGames])

  const error = useGamesStore(state => state.error)
  const clearError = useGamesStore(state => state.clearError)

  const setAdmin = useAuthStore(state => state.setAdmin)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdmin(!!session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAdmin(!!session)
    })
    return () => subscription.unsubscribe()
  }, [setAdmin])

  // UI State
  const [open, setOpen] = useState(false)
  const [currentGameId, setCurrentGameId] = useState<number | undefined>()
  // Always read the selected game from the store so edits are reflected immediately
  const currentGame = useGamesStore(state =>
    currentGameId === undefined ? undefined : state.games.find(g => g.id === currentGameId)
  )
  const selectGame = useCallback((game: Game) => setCurrentGameId(game.id), [])

  // Video
  const isVideoPlayed = useGameStore(state => state.isVideoPlayed)
  const toggleVideo = useGameStore(state => state.toggleVideo)

  const videoUrl = useMemo(() => {
    if (!hasRuleVideo(currentGame?.ruleVideoUrl)) return ""
    return `${currentGame.ruleVideoUrl.trim()}?autoplay=1&rel=0`
  }, [currentGame])

  const closeVideo = useCallback(() => {
    toggleVideo()
  }, [toggleVideo])

  // Render
  return (
    <>
      <Topbar />

      <Content
        updateGame={selectGame}
        updateOpen={setOpen}
      />

      <Disclaimer
        open={open}
        updateOpen={setOpen}
        item={currentGame}
      />

      {isVideoPlayed && (
        <Suspense fallback={<div>Loading video...</div>}>

          <VideoPlayer
            url={videoUrl}
            close={closeVideo}
          />
        </Suspense>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" onClose={clearError} variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </>
  )
}

export default App