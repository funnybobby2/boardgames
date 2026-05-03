import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Disclaimer.module.scss"
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserGroup, faStopwatch, faCakeCandles, faCheck, faVideo } from '@fortawesome/free-solid-svg-icons'
import axios from "axios";
import DOMPurify from "dompurify";
import { Switch, Rate } from "lazy-smart-ui-lib";
import { useGameStore } from "../../store/useGameStore";
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

  const changeRate = useCallback(async (value: number) => {
    if (!item) return;
    const updated = { ...item, note: value };
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/write-json`, updated);
      setRate(value);
    } catch (e) {
      console.error("Échec de la mise à jour de la note", e);
    }
  }, [item]);

  const toggleValidation = useCallback(async (value: boolean) => {
    if (!item) return;
    const updated = { ...item, isPlayed: value };
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/write-json`, updated);
      setCheck(value);
    } catch (e) {
      console.error("Échec de la mise à jour du statut joué", e);
    }
  }, [item]);

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
                />
              </div>
              <div dangerouslySetInnerHTML={safeResume} />
            </div>
            <div className={styles.tags}>
              <div className={styles.tag}><FontAwesomeIcon icon={faStopwatch} /> {item?.duration} min</div>
              <div className={styles.tag}><FontAwesomeIcon icon={faCakeCandles} /> A partir de {item?.ageMin} ans</div>
              <div className={styles.tag}><FontAwesomeIcon icon={faUserGroup} /> {people}</div>
              <Switch custom="validator" isSimple initialChecked={check} label={<FontAwesomeIcon icon={faCheck} />} labelPosition="left" onClick={toggleValidation} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
