import React, { useMemo, useEffect, useCallback } from "react"
import styles from "./Content.module.scss"

import Card from "../Card/Card"

import { filterGames } from "../../utils/filterGames"
import { Game } from "../../types/Game"
import { useGameStore } from "../../store/useGameStore"
import { useGamesStore } from "../../store/useGamesStore"

type ContentProps = {
  updateGame: (game: Game) => void;
  updateOpen: (open: boolean) => void;
};

const Content = React.memo(function Content({ updateGame, updateOpen }: ContentProps) {

  const setFilteredTotal = useGameStore(state => state.setFilteredTotal);
  const setTotal = useGameStore(state => state.setTotal);
  const filters = useGameStore(state => state.filters);
  const games = useGamesStore(state => state.games);
  const isLoaded = useGamesStore(state => state.isLoaded);

  useEffect(() => {
    setTotal(games.length);
  }, [games.length, setTotal]);

  const filteredGames = useMemo(() => {
    return filterGames(games, filters);
  }, [games, filters]);

  useEffect(() => {
    setFilteredTotal(filteredGames.length);
  }, [filteredGames.length, setFilteredTotal]);

  const handleSelect = useCallback(() => updateOpen(true), [updateOpen]);

  if (!isLoaded) return null;

  return (
    <div className={styles.content}>
      {filteredGames.map((g) => (
        <Card key={g.id} item={g} updateGame={updateGame} onSelect={handleSelect} />
      ))}
    </div>
  );
});

export default Content;
