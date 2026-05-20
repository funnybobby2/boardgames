import "./App.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min"

import { useState, useMemo, useCallback, Suspense, lazy, useEffect } from "react"

import Topbar from "./components/Topbar/Topbar"
import Content from "./components/Content/Content"
import Disclaimer from "./components/Disclaimer/Disclaimer"

import { useGameFilters } from "./hooks/useGameFilters"
import { Game } from "./types/Game"
import { useGameStore } from "./store/useGameStore"
import { useGamesStore } from "./store/useGamesStore"
import { useAuthStore } from "./store/useAuthStore"
import { supabase } from "./lib/supabase"

const VideoPlayer = lazy(() => import("./components/VideoPlayer/VideoPlayer"))

function App() {

  const loadGames = useGamesStore(state => state.loadGames)
  useEffect(() => { loadGames() }, [loadGames])

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

  // Filters logic
  const { filters } = useGameFilters()

  // UI State
  const [open, setOpen] = useState(false)
  const [currentGame, setCurrentGame] = useState<Game | undefined>()

  // Video
  const isVideoPlayed = useGameStore(state => state.isVideoPlayed)
  const toggleVideo = useGameStore(state => state.toggleVideo)

  const videoUrl = useMemo(() => {
    if (!currentGame?.ruleVideoUrl) return ""
    return `${currentGame.ruleVideoUrl}?autoplay=1&rel=0`
  }, [currentGame])

  const closeVideo = useCallback(() => {
    toggleVideo()
  }, [toggleVideo])

  // Render
  return (
    <>
      <Topbar />

      <Content
        {...filters}
        updateGame={setCurrentGame}
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
    </>
  )
}

export default App