import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Disclaimer.module.scss"
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGroup, faStopwatch, faCakeCandles, faCheck, faVideo, faPencil } from '@fortawesome/free-solid-svg-icons'
import DOMPurify from "dompurify";
import { Switch, Rate } from "lazy-smart-ui-lib";
import { useGameStore } from "../../store/useGameStore";
import { useGamesStore } from "../../store/useGamesStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Game } from "../../types/Game";
import AddGameModal from "../AddGameModal/AddGameModal";

const TAG_PALETTE = [
  { background: '#2ecc71', color: '#393939' },
  { background: '#f39c12', color: '#393939' },
  { background: '#e74c3c', color: '#393939' },
  { background: '#9b59b6', color: '#393939' },
  { background: '#22a6b3', color: '#393939' },
  { background: '#badc58', color: '#393939' },
]

type DisclaimerProps = {
  open: boolean;
  updateOpen: (bool: boolean) => void;
  item: Game | undefined;
};

export default function Disclaimer({ open, updateOpen, item }: DisclaimerProps) {

  const [rate, setRate] = useState(0);
  const [check, setCheck] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const toggleVideo = useGameStore(state => state.toggleVideo);
  const updateGame = useGamesStore(state => state.updateGame);
  const isAdmin = useAuthStore(state => state.isAdmin);

  useEffect(() => {
    setRate(item?.note ?? 0);
    setCheck(item?.isPlayed ?? false);
  }, [item]);

  const onCloseModal = useCallback(() => updateOpen(false), [updateOpen]);

  const people = useMemo(() => {
    if (!item) return "";
    if (item.nbUserMin === item.nbUserMax && item.nbUserMin === 1) return "Solo";
    if (item.nbUserMin === item.nbUserMax && item.nbUserMin === 2) return "Duel";
    return `De ${item.nbUserMin} à ${item.nbUserMax}`;
  }, [item?.nbUserMin, item?.nbUserMax]);

  const safeResume = useMemo(
    () => ({ __html: DOMPurify.sanitize(item?.resume ?? "") }),
    [item?.resume]
  );

  const changeRate = useCallback((value: number) => {
    if (!item) return;
    updateGame(item.id, { note: value });
    setRate(value);
  }, [item, updateGame]);

  const toggleValidation = useCallback((value: boolean) => {
    if (!item) return;
    updateGame(item.id, { isPlayed: value });
    setCheck(value);
  }, [item, updateGame]);

  return (
    <div>
      <AddGameModal open={editOpen} onClose={() => setEditOpen(false)} game={item} />
      <Modal open={open} onClose={onCloseModal}>
        <h2>{item?.title}</h2>

        <div className={styles.card}>
          <div className={styles.picture}>
            <img src={`./assets/${item?.img}`} alt={item?.title} />
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              {item?.ruleVideoUrl !== "" && <FontAwesomeIcon icon={faVideo} onClick={toggleVideo} />}
              {isAdmin && <FontAwesomeIcon icon={faPencil} onClick={() => setEditOpen(true)} />}
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
                <Rate
                  value={rate}
                  max={10}
                  size="large"
                  onChange={(newValue) => changeRate(newValue ?? 0)}
                  isreadonly={!isAdmin}
                />
              </div>
              <div dangerouslySetInnerHTML={safeResume} />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}><FontAwesomeIcon icon={faStopwatch} /> {item?.duration} min</div>
              <div className={styles.tag}><FontAwesomeIcon icon={faCakeCandles} /> A partir de {item?.ageMin} ans</div>
              <div className={styles.tag}><FontAwesomeIcon icon={faUserGroup} /> {people}</div>
              <Switch custom="validator" isSimple initialChecked={check} label={<FontAwesomeIcon icon={faCheck} />} labelPosition="left" onClick={toggleValidation} disabled={!isAdmin} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
