import React, { useMemo, useEffect, useCallback } from "react"
import styles from "./Content.module.scss"

import gameData from "../../assets/data/data.json"

import Card from "../Card/Card"

import { filterGames } from "../../utils/filterGames"
import { Game } from "../../types/Game"
import { useGameStore } from "../../store/useGameStore"

type ContentProps = {
  updateGame: (game: Game) => void;
  updateOpen: (open: boolean) => void;
};

const TOTAL = gameData.games.length;

const Content = React.memo(function Content({ updateGame, updateOpen }: ContentProps) {

  const setFilteredTotal = useGameStore(state => state.setFilteredTotal);
  const setTotal = useGameStore(state => state.setTotal);
  const filters = useGameStore(state => state.filters);

  useEffect(() => {
    setTotal(TOTAL);
  }, [setTotal]);

  const filteredGames = useMemo(() => {
    return filterGames(gameData.games, filters);
  }, [filters]);

  useEffect(() => {
    setFilteredTotal(filteredGames.length);
  }, [filteredGames.length, setFilteredTotal]);

  const handleSelect = useCallback(() => updateOpen(true), [updateOpen]);

  return (
    <div className={styles.content}>
      {filteredGames.map((g) => (
        <Card key={g.id} item={g} updateGame={updateGame} onSelect={handleSelect} />
      ))}
    </div>
  );
});

export default Content;
