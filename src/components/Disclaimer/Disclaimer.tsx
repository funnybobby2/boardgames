import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Disclaimer.module.scss"
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGroup, faStopwatch, faCakeCandles, faCheck, faVideo } from '@fortawesome/free-solid-svg-icons'
import DOMPurify from "dompurify";
import { Switch, Rate } from "lazy-smart-ui-lib";
import { useGameStore } from "../../store/useGameStore";
import { useGamesStore } from "../../store/useGamesStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Game } from "../../types/Game";

type DisclaimerProps = {
  open: boolean;
  updateOpen: (bool: boolean) => void;
  item: Game | undefined;
};

export default function Disclaimer({ open, updateOpen, item }: DisclaimerProps) {

  const [rate, setRate] = useState(0);
  const [check, setCheck] = useState(false);

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
      <Modal open={open} onClose={onCloseModal}>
        <h2>{item?.title}</h2>

        <div className={styles.card}>
          <div className={styles.picture}>
            <img src={`./assets/${item?.img}`} alt={item?.title} />
            {item?.ruleVideoUrl !== "" && <FontAwesomeIcon icon={faVideo} onClick={toggleVideo} />}
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
