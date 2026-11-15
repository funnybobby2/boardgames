import { useCallback, useMemo, useState } from "react";
import styles from "./Disclaimer.module.scss"
import { Dialog, IconButton } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGroup, faStopwatch, faCakeCandles, faCheck, faVideo, faPencil, faDollarSign, faXmark } from '@fortawesome/free-solid-svg-icons'
import DOMPurify from "dompurify";
import { Switch, Rate } from "lazy-smart-ui-lib";
import { useGameStore } from "../../store/useGameStore";
import { useGamesStore } from "../../store/useGamesStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Game } from "../../types/Game";
import AddGameModal from "../AddGameModal/AddGameModal";
import { hasRuleVideo } from "../../utils/video";

const TAG_PALETTE = [
  { background: '#2ecc71', color: '#393939' },
  { background: '#f39c12', color: '#393939' },
  { background: '#e74c3c', color: '#393939' },
  { background: '#9b59b6', color: '#393939' },
  { background: '#22a6b3', color: '#393939' },
  { background: '#badc58', color: '#393939' },
]

function formatPlayers(item: Game | undefined): string {
  if (!item) return "";
  if (item.nbUserMin === item.nbUserMax && item.nbUserMin === 1) return "Solo";
  if (item.nbUserMin === item.nbUserMax && item.nbUserMin === 2) return "Duel";
  return `De ${item.nbUserMin} à ${item.nbUserMax}`;
}

type DisclaimerProps = {
  open: boolean;
  updateOpen: (bool: boolean) => void;
  item: Game | undefined;
};

export default function Disclaimer({ open, updateOpen, item }: DisclaimerProps) {

  const [editOpen, setEditOpen] = useState(false);

  const toggleVideo = useGameStore(state => state.toggleVideo);
  const updateGame = useGamesStore(state => state.updateGame);
  const isAdmin = useAuthStore(state => state.isAdmin);

  // `item` comes straight from the store, which applies updates optimistically and rolls
  // them back on error, so no local copy is needed.
  const rate = item?.note ?? 0;
  const check = item?.isPlayed ?? false;
  const forSale = item?.forSale ?? false;

  const onCloseModal = useCallback(() => updateOpen(false), [updateOpen]);

  const people = formatPlayers(item);

  const safeResume = useMemo(
    () => ({ __html: DOMPurify.sanitize(item?.resume ?? "") }),
    [item?.resume]
  );

  const changeRate = useCallback((value: number) => {
    if (item) updateGame(item.id, { note: value });
  }, [item, updateGame]);

  const toggleValidation = useCallback((value: boolean) => {
    if (item) updateGame(item.id, { isPlayed: value });
  }, [item, updateGame]);

  const toggleForSaleCallback = useCallback((value: boolean) => {
    if (item) updateGame(item.id, { forSale: value });
  }, [item, updateGame]);

  return (
    <div>
      <AddGameModal open={editOpen} onClose={() => setEditOpen(false)} game={item} />
      <Dialog
        open={open}
        onClose={onCloseModal}
        fullWidth
        maxWidth={false}
        // The rules video iframe is rendered outside the dialog: don't steal its focus
        disableEnforceFocus
        // sx (not the CSS module) so these win over MUI's own Paper styles
        slotProps={{
          paper: {
            sx: {
              maxWidth: { xs: "95vw", sm: 800 },
              width: { xs: "95vw", sm: "calc(100% - 64px)" },
              mx: { xs: "auto", sm: 4 },
              pb: "1.2rem",
              bgcolor: "#f6f6f6",
              borderRadius: "5px",
            },
          },
        }}
      >
        <IconButton aria-label="Fermer" onClick={onCloseModal} className={styles.closeButton}>
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
        <h2 className={styles.modalTitle}>{item?.title}</h2>

        <div className={styles.card}>
          <div className={styles.picture}>
            <img src={`./assets/${item?.img}`} alt={item?.title} />
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              {hasRuleVideo(item?.ruleVideoUrl) && (
                <button type="button" className="unstyled-button" onClick={toggleVideo} aria-label="Voir la vidéo des règles">
                  <FontAwesomeIcon icon={faVideo} />
                </button>
              )}
              {isAdmin && (
                <button type="button" className="unstyled-button" onClick={() => setEditOpen(true)} aria-label="Modifier le jeu">
                  <FontAwesomeIcon icon={faPencil} />
                </button>
              )}
            </div>
            {item?.category && item.category.length > 0 && (
              <div className={styles.categories}>
                {[...item.category].sort().map((cat, i) => (
                  <span key={cat} className={styles.categoryTag} style={TAG_PALETTE[i % TAG_PALETTE.length]}>
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className={styles.info}>

            <div className={styles.summary}>
              <div className={styles.description}>
                <span>DESCRIPTION</span>
                {/* Rate (like Switch) only reads `value` on mount: the key forces a remount when it changes */}
                <Rate
                  key={`rate-${item?.id}-${rate}`}
                  value={rate}
                  max={10}
                  size="large"
                  onChange={(newValue) => changeRate(newValue ?? 0)}
                  isreadonly={!isAdmin}
                />
              </div>
              <div className={styles.resume} dangerouslySetInnerHTML={safeResume} />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}><FontAwesomeIcon icon={faStopwatch} /> {item?.duration} min</div>
              <div className={styles.tag}><FontAwesomeIcon icon={faCakeCandles} /> A partir de {item?.ageMin} ans</div>
              <div className={styles.tag}><FontAwesomeIcon icon={faUserGroup} /> {people}</div>
              <div className={styles.switchGroup}>
                {/* Switch only reads initialChecked on mount: the key forces a remount when the game or value changes */}
                <Switch key={`played-${item?.id}-${check}`} custom="validator" isSimple initialChecked={check} label={<FontAwesomeIcon icon={faCheck} />} labelPosition="left" onClick={toggleValidation} disabled={!isAdmin} />
                {isAdmin && <Switch key={`sale-${item?.id}-${forSale}`} custom="validator" isSimple initialChecked={forSale} label={<FontAwesomeIcon icon={faDollarSign} />} labelPosition="left" onClick={toggleForSaleCallback} />}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
