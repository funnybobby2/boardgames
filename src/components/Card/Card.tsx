import { useCallback, useState } from "react"
import styles from "./Card.module.scss"
import { Game } from "../../types/Game"

type CardProps = {
  item: Game;
  updateGame: (game: Game) => void;
  onSelect: () => void;
};

/** Placeholder shown while games are loading (reuses the card's shimmer animation). */
export function CardSkeleton() {
  return (
    <div className={styles.itemContainer} aria-hidden="true">
      <div className={styles.item} />
    </div>
  )
}

export default function Card({ item, updateGame, onSelect }: CardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const selectGame = useCallback(() => {
    updateGame(item);
    onSelect();
  }, [item, updateGame, onSelect]);

  return (
    <button type="button" className={`unstyled-button ${styles.itemContainer}`} onClick={selectGame}>
      <div className={`${styles.item} ${item.isPlayed ? styles.played : ''} ${isLoaded ? styles.loaded : ''}`}>
        <img
          src={`./assets/${item.img}`}
          alt={item.title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={isLoaded ? styles.imageLoaded : styles.imageLoading}
        />
        {item.forSale && <div className={styles.forSaleBadge}>à vendre</div>}
      </div>
    </button>
  )
}
