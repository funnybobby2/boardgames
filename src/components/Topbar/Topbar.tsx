import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import styles from "./Topbar.module.scss"
import diceIcon from '../../assets/dice.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserLarge, faUserGroup, faUsers, faStopwatch, faClipboardCheck, faClipboardQuestion, faClipboard, faCakeCandles, faSort, faSortAsc, faSortDesc, faPlus, faDollarSign, faTags } from '@fortawesome/free-solid-svg-icons'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Badge from '@mui/material/Badge';
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Menu, MenuItem, Checkbox, ListItemText } from "@mui/material";
import { useGameStore } from "../../store/useGameStore";
import { useGamesStore } from "../../store/useGamesStore";
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
    toggleForSale,
    toggleCategory,
    clearCategories,
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
    toggleForSale: state.toggleForSale,
    toggleCategory: state.toggleCategory,
    clearCategories: state.clearCategories,
  })));

  const { ageMin, duration, isPlayed, isSorted, nbUsers, query, forSale, categories } = filters;

  // Category filter: every category present in the collection, with its game count
  const games = useGamesStore(state => state.games);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    games.forEach(g => g.category?.forEach(c => counts.set(c, (counts.get(c) ?? 0) + 1)));
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [games]);
  const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);

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
          <button
            type="button"
            className="unstyled-button"
            onClick={handleDiceClick}
            aria-label={isAdmin ? "Déconnexion admin" : `Connexion admin (${filteredTotal} jeux affichés sur ${total})`}
          >
            <img src={diceIcon} alt="" />
          </button>
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
                p: "4px 6px",
                "&:hover": { backgroundColor: "primary.dark" },
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </IconButton>
          </Tooltip>
        )}

        <div className={styles.filters}>
          <ButtonGroup size="large" variant="contained" aria-label="Filtres">
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
                <Button className={duration === undefined ? styles.disactive : ""} onClick={cycleDuration}
                  aria-label={duration === undefined ? "Durée maximum : toutes" : `Durée maximum : ${duration} min`}>
                  <FontAwesomeIcon icon={faStopwatch} />
                </Button>
              </Badge>
            </Tooltip>

            <Tooltip title="Age minimum requis">
              <Badge badgeContent={ageMin} color="secondary" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} className={styles.badge}>
                <Button className={ageMin === undefined ? styles.disactive : ""} onClick={cycleAge}
                  aria-label={ageMin === undefined ? "Âge minimum : tous" : `Âge minimum : ${ageMin} ans`}>
                  <FontAwesomeIcon icon={faCakeCandles} />
                </Button>
              </Badge>
            </Tooltip>

            <Tooltip title="Tri par note">
              <Button className={isSorted === undefined ? styles.disactive : ""} onClick={toggleSort}>{sortBtn}</Button>
            </Tooltip>

            <Tooltip title="Catégories">
              <Badge badgeContent={categories.length} color="secondary" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} className={styles.badge}>
                <Button
                  className={categories.length === 0 ? styles.disactive : ""}
                  onClick={e => setCategoryAnchor(e.currentTarget)}
                  aria-label={categories.length === 0 ? "Catégories : toutes" : `Catégories : ${categories.join(", ")}`}
                  aria-haspopup="menu"
                  aria-expanded={!!categoryAnchor}
                >
                  <FontAwesomeIcon icon={faTags} />
                </Button>
              </Badge>
            </Tooltip>

            <Tooltip title="Jeux à vendre">
              <Button className={forSale === undefined ? styles.disactive : ""} onClick={toggleForSale}>
                <FontAwesomeIcon icon={faDollarSign} />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Menu
            anchorEl={categoryAnchor}
            open={!!categoryAnchor}
            onClose={() => setCategoryAnchor(null)}
            slotProps={{ paper: { sx: { maxHeight: 400 } } }}
          >
            <MenuItem onClick={clearCategories} disabled={categories.length === 0} dense>
              <ListItemText primary="Toutes les catégories" />
            </MenuItem>
            {categoryCounts.map(([category, count]) => (
              <MenuItem key={category} onClick={() => toggleCategory(category)} dense>
                <Checkbox checked={categories.includes(category)} size="small" sx={{ p: 0, mr: 1 }} />
                <ListItemText primary={category} />
                <span className={styles.categoryCount}>{count}</span>
              </MenuItem>
            ))}
          </Menu>
        </div>

        <input value={localQuery} onChange={handleSearch} type="text" className={styles.searchInput} aria-label="Rechercher un jeu" placeholder="Rechercher" />
      </div>
    </div>
  );
}
