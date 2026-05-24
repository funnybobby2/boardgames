import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import styles from "./Topbar.module.scss"
import diceIcon from '../../assets/dice.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserLarge, faUserGroup, faUsers, faStopwatch, faClipboardCheck, faClipboardQuestion, faClipboard, faCakeCandles, faSort, faSortAsc, faSortDesc, faPlus } from '@fortawesome/free-solid-svg-icons'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Badge from '@mui/material/Badge';
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import { useGameStore } from "../../store/useGameStore";
import { useAuthStore } from "../../store/useAuthStore";
import { supabase } from "../../lib/supabase";
import { useShallow } from "zustand/react/shallow";
import AddGameModal from "../AddGameModal/AddGameModal";

export default function Topbar() {

  const {
    filters,
    total,
    filteredTotal,
    cycleAge,
    cycleDuration,
    toggleIsPlayed,
    cycleUsers,
    setQuery,
    toggleSort,
  } = useGameStore(useShallow(state => ({
    filters: state.filters,
    total: state.total,
    filteredTotal: state.filteredTotal,
    cycleAge: state.cycleAge,
    cycleDuration: state.cycleDuration,
    toggleIsPlayed: state.toggleIsPlayed,
    cycleUsers: state.cycleUsers,
    setQuery: state.setQuery,
    toggleSort: state.toggleSort,
  })));

  const { ageMin, duration, isPlayed, isSorted, nbUsers, query } = filters;

  const nbUsersBtn = useMemo(() => (
    nbUsers === 1 ? <FontAwesomeIcon icon={faUserLarge} /> :
    nbUsers === 2 ? <FontAwesomeIcon icon={faUserGroup} /> :
    <FontAwesomeIcon icon={faUsers} />
  ), [nbUsers]);

  const isPlayedBtn = useMemo(() => (
    isPlayed === undefined ? <FontAwesomeIcon icon={faClipboard} /> :
    isPlayed ? <FontAwesomeIcon icon={faClipboardCheck} /> :
    <FontAwesomeIcon icon={faClipboardQuestion} />
  ), [isPlayed]);

  const sortBtn = useMemo(() => (
    isSorted === undefined ? <FontAwesomeIcon icon={faSort} /> :
    isSorted ? <FontAwesomeIcon icon={faSortAsc} /> :
    <FontAwesomeIcon icon={faSortDesc} />
  ), [isSorted]);

  const { isAdmin, setAdmin } = useAuthStore();
  const [loginOpen, setLoginOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [loginError, setLoginError] = useState(false);

  const handleDiceClick = useCallback(async () => {
    if (isAdmin) {
      await supabase.auth.signOut();
      setAdmin(false);
      return;
    }
    setLoginValue("");
    setPasswordValue("");
    setLoginError(false);
    setLoginOpen(true);
  }, [isAdmin, setAdmin]);

  const handleLoginSubmit = useCallback(async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginValue,
      password: passwordValue,
    });
    if (error) {
      setLoginError(true);
    } else {
      setAdmin(true);
      setLoginOpen(false);
    }
  }, [loginValue, passwordValue, setAdmin]);

  const [localQuery, setLocalQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(value), 300);
  }, [setQuery]);

  return (
    <div className={styles.topbar}>

      <div className={styles.left}>
        <Tooltip title={isAdmin ? "Déconnexion admin" : `${filteredTotal}/${total}`}>
          <img src={diceIcon} alt="logo" onClick={handleDiceClick} style={{ cursor: "pointer" }} />
        </Tooltip>

        <AddGameModal open={addOpen} onClose={() => setAddOpen(false)} />

        <Dialog open={loginOpen} onClose={() => setLoginOpen(false)}>
          <DialogTitle>Connexion admin</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
            <TextField
              label="Email"
              value={loginValue}
              onChange={e => { setLoginValue(e.target.value); setLoginError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLoginSubmit()}
              error={loginError}
              autoFocus
            />
            <TextField
              label="Mot de passe"
              type="password"
              value={passwordValue}
              onChange={e => { setPasswordValue(e.target.value); setLoginError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLoginSubmit()}
              error={loginError}
              helperText={loginError ? "Identifiants incorrects" : ""}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLoginOpen(false)}>Annuler</Button>
            <Button onClick={handleLoginSubmit} variant="contained">Connexion</Button>
          </DialogActions>
        </Dialog>
        <div className={styles.neon}>Fun<span className={styles.flickerSlow}>n</span>y ga<span className={styles.flickerFast}>m</span>es</div>
      </div>

      <div className={styles.right}>

        {isAdmin && (
          <Tooltip title="Ajouter un jeu">
            <IconButton
              onClick={() => setAddOpen(true)}
              size="small"
              sx={{
                backgroundColor: "primary.main",
                color: "#fff",
                mr: "10px",
                "&:hover": { backgroundColor: "primary.dark" },
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </IconButton>
          </Tooltip>
        )}

        <div className={styles.filters}>
          <ButtonGroup size="large" variant="contained" aria-label="Basic button group">
            <Tooltip title="Jamais joué, déjà joué ou les 2 ?">
              <Button className={isPlayed === undefined ? styles.disactive : ""}
                onClick={toggleIsPlayed}>{isPlayedBtn}</Button>
            </Tooltip>

            <Tooltip title="Solo, duel ou multi-joueurs ?">
              <Button className={nbUsers === 4 ? styles.disactive : ""}
                onClick={cycleUsers}>{nbUsersBtn}</Button>
            </Tooltip>

            <Tooltip title="Durée moyenne max">
              <Badge badgeContent={duration} color="secondary" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} className={styles.badge}>
                <Button className={duration === undefined ? styles.disactive : ""} onClick={cycleDuration}>
                  <FontAwesomeIcon icon={faStopwatch} />
                </Button>
              </Badge>
            </Tooltip>

            <Tooltip title="Age minimum requis">
              <Badge badgeContent={ageMin} color="secondary" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} className={styles.badge}>
                <Button className={ageMin === undefined ? styles.disactive : ""} onClick={cycleAge}>
                  <FontAwesomeIcon icon={faCakeCandles} />
                </Button>
              </Badge>
            </Tooltip>

            <Tooltip title="Tri par note">
              <Button className={isSorted === undefined ? styles.disactive : ""} onClick={toggleSort}>{sortBtn}</Button>
            </Tooltip>
          </ButtonGroup>
        </div>

        <input value={localQuery} onChange={handleSearch} type="text" className={styles.searchInput} aria-label="Search" placeholder="Search" />
      </div>
    </div>
  );
}
