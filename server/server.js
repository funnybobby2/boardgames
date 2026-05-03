import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// Route POST pour écrire dans un fichier JSON
app.post('/api/write-json', async (req, res) => {
  try {
    // Récupérer les données de la requête
    const data = req.body;

    // Chemin vers le fichier JSON
    const filePath = join(__dirname, '../src/assets/data/data.json');

    // Lire les données du fichier JSON
    const fileData = await fs.readFile(filePath, 'utf8');
    let gamesData = JSON.parse(fileData);

    // Trouver l'index de l'élément à mettre à jour
    let index = gamesData.games.findIndex(item => item.id === data.id);

    if (index !== -1) {
      // Remplacer l'élément
      gamesData.games[index] = data;
    } else {
      // Si l'élément n'existe pas, on peut l'ajouter (si besoin)
      gamesData.games.push(data);
    }

    // Écrire les nouvelles données dans le fichier JSON
    await fs.writeFile(filePath, JSON.stringify(gamesData, null, 2));

    // Répondre au client avec succès
    res.status(200).json({ message: 'Données mises à jour avec succès' });
  } catch (err) {
    console.error('Erreur lors de l\'écriture du fichier JSON:', err);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
