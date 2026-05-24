import { useState, useEffect, useMemo } from "react"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Checkbox, FormControlLabel, Alert, Autocomplete,
  Grid2
} from "@mui/material"
import { useGamesStore } from "../../store/useGamesStore"
import { Game } from "../../types/Game"

type Props = {
  open: boolean
  onClose: () => void
  game?: Game
}

type FormState = Omit<Game, "category"> & { category: string[] }

const defaultForm = (id: number): FormState => ({
  id,
  title: "",
  group: "",
  nbUserMin: 1,
  nbUserMax: 4,
  duration: 60,
  ageMin: 8,
  isPlayed: false,
  category: [],
  resume: "",
  ruleVideoUrl: "https://www.youtube.com/embed/",
  img: "",
  note: 0,
  isExtension: false,
})

export default function AddGameModal({ open, onClose, game }: Props) {
  const addGame = useGamesStore(state => state.addGame)
  const editGame = useGamesStore(state => state.editGame)
  const games = useGamesStore(state => state.games)
  const nextId = games.length > 0 ? Math.max(...games.map(g => g.id)) + 1 : 1
  const isEdit = !!game

  const allCategories = useMemo(() =>
    [...new Set(games.flatMap(g => g.category))].sort()
  , [games])

  const [form, setForm] = useState<FormState>(() =>
    game ? { ...game } : defaultForm(nextId)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm(game ? { ...game } : defaultForm(nextId))
      setError(null)
    }
  }, [open, game])

  const set = (field: keyof FormState, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const err = isEdit ? await editGame({ ...form }) : await addGame({ ...form })
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      onClose()
    }
  }

  const num = (field: keyof FormState) => ({
    type: "number" as const,
    value: form[field] as number,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(field, Number(e.target.value)),
  })

  const txt = (field: keyof FormState) => ({
    value: form[field] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(field, e.target.value),
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Modifier le jeu" : "Ajouter un jeu"}</DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <TextField
              label="ID"
              fullWidth
              type="number"
              value={form.id}
              onChange={e => set("id", Number(e.target.value))}
              size="small"
              helperText={isEdit ? undefined : `Prochain ID suggéré : ${nextId}`}
              disabled={isEdit}
            />
          </Grid2>
          <Grid2 size={12}>
            <TextField label="Titre" fullWidth required {...txt("title")} />
          </Grid2>
          <Grid2 size={12}>
            <TextField label="Groupe / Série" fullWidth {...txt("group")} />
          </Grid2>
          <Grid2 size={6}>
            <TextField label="Joueurs min" fullWidth {...num("nbUserMin")} slotProps={{ htmlInput: { min: 1 } }} />
          </Grid2>
          <Grid2 size={6}>
            <TextField label="Joueurs max" fullWidth {...num("nbUserMax")} slotProps={{ htmlInput: { min: 1 } }} />
          </Grid2>
          <Grid2 size={6}>
            <TextField label="Durée (min)" fullWidth {...num("duration")} slotProps={{ htmlInput: { min: 1 } }} />
          </Grid2>
          <Grid2 size={6}>
            <TextField label="Âge minimum" fullWidth {...num("ageMin")} slotProps={{ htmlInput: { min: 1 } }} />
          </Grid2>
          <Grid2 size={12}>
            <Autocomplete
              multiple
              freeSolo
              options={allCategories}
              value={form.category}
              onChange={(_, value) => set("category", value)}
              renderInput={params => (
                <TextField {...params} label="Catégories" placeholder="Sélectionner ou saisir..." />
              )}
            />
          </Grid2>
          <Grid2 size={12}>
            <TextField label="Image (nom du fichier)" fullWidth placeholder="mon-jeu.jpg" {...txt("img")} />
          </Grid2>
          <Grid2 size={12}>
            <TextField label="URL vidéo règles" fullWidth {...txt("ruleVideoUrl")} />
          </Grid2>
          <Grid2 size={12}>
            <TextField
              label="Description (HTML)"
              fullWidth
              multiline
              rows={4}
              {...txt("resume")}
            />
          </Grid2>
          <Grid2 size={6}>
            <TextField label="Note (0-10)" fullWidth {...num("note")} slotProps={{ htmlInput: { min: 0, max: 10 } }} />
          </Grid2>
          <Grid2 size={3}>
            <FormControlLabel
              control={<Checkbox checked={form.isPlayed} onChange={e => set("isPlayed", e.target.checked)} />}
              label="Joué"
            />
          </Grid2>
          <Grid2 size={3}>
            <FormControlLabel
              control={<Checkbox checked={form.isExtension} onChange={e => set("isExtension", e.target.checked)} />}
              label="Extension"
            />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !form.title}>
          {loading ? (isEdit ? "Enregistrement..." : "Ajout...") : (isEdit ? "Enregistrer" : "Ajouter")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
