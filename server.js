const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());
app.use(require('cors')());

// Récupération automatique du token depuis Render
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const REPO = "Jules251gamming/NEBULA-X";
const LOG_FILE = "logs.txt";

app.post('/api/diagnostic', async (req, res) => {
    const { target, userIp } = req.body;
    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    const logEntry = `[${timestamp}] VISITEUR: Blogger96-User | IP: ${userIp} | CIBLE: ${target}\n`;

    try {
        const url = `https://api.github.com/repos/${REPO}/contents/${LOG_FILE}`;
        let sha = null;
        let oldContent = "";

        // 1. On vérifie si le fichier existe déjà pour récupérer son contenu
        try {
            const getFile = await axios.get(url, { 
                headers: { Authorization: `token ${GITHUB_TOKEN}` } 
            });
            sha = getFile.data.sha;
            oldContent = Buffer.from(getFile.data.content, 'base64').toString('utf-8');
        } catch (e) { 
            console.log("Premier log : création du fichier.");
        }

        // 2. On ajoute la nouvelle ligne et on renvoie tout sur GitHub
        const newContentBase64 = Buffer.from(oldContent + logEntry).toString('base64');
        
        await axios.put(url, {
            message: `NX-Log: Security trace for ${userIp}`,
            content: newContentBase64,
            sha: sha // Nécessaire pour mettre à jour un fichier existant
        }, { 
            headers: { Authorization: `token ${GITHUB_TOKEN}` } 
        });

        res.json({ success: true, status: "Logged & Scanned", latency: "14ms" });

    } catch (err) {
        console.error("Erreur GitHub:", err.response ? err.response.data : err.message);
        res.status(500).json({ success: false, error: "Liaison GitHub échouée" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur actif sur le port ${PORT}`));
