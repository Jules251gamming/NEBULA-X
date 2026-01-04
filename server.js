const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
app.use(require('cors')());

// IMPORTANT : Dit au serveur d'utiliser tes fichiers HTML/CSS
app.use(express.static(path.join(__dirname, 'public'))); 

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = "Jules251gamming/NEBULA-X";
const LOG_FILE = "logs.txt";

// Route pour l'API de diagnostic et logs
app.post('/api/diagnostic', async (req, res) => {
    const { target, userIp } = req.body;
    const logEntry = `[${new Date().toLocaleString()}] IP: ${userIp} -> Cible: ${target}\n`;

    try {
        const url = `https://api.github.com/repos/${REPO}/contents/${LOG_FILE}`;
        let sha = null;
        let oldContent = "";

        try {
            const getFile = await axios.get(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
            sha = getFile.data.sha;
            oldContent = Buffer.from(getFile.data.content, 'base64').toString('utf-8');
        } catch (e) { }

        const newContentBase64 = Buffer.from(oldContent + logEntry).toString('base64');
        await axios.put(url, {
            message: `Audit Log: ${userIp}`,
            content: newContentBase64,
            sha: sha
        }, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });

        res.json({ success: true, status: "Logged" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Route par défaut qui renvoie ton fichier HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT || 3000);
