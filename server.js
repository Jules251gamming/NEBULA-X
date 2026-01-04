const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());
app.use(require('cors')());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Ton Token
const REPO = "Jules251gamming/NEBULA-X";
const LOG_FILE = "logs.txt";

app.post('/api/diagnostic', async (req, res) => {
    const { target, userIp } = req.body;
    const logEntry = `[${new Date().toLocaleString()}] IP: ${userIp} -> Cible: ${target}\n`;

    try {
        const url = `https://api.github.com/repos/${REPO}/contents/${LOG_FILE}`;
        let sha = null;
        let oldContent = "";

        // 1. Lire l'ancien fichier (si il existe)
        try {
            const getFile = await axios.get(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
            sha = getFile.data.sha;
            oldContent = Buffer.from(getFile.data.content, 'base64').toString('utf-8');
        } catch (e) { /* Premier log, le fichier n'existe pas encore */ }

        // 2. Écrire le nouveau log
        const newContentBase64 = Buffer.from(oldContent + logEntry).toString('base64');
        await axios.put(url, {
            message: `NX-Audit: Log from ${userIp}`,
            content: newContentBase64,
            sha: sha
        }, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });

        res.json({ success: true, latency: "21ms" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.listen(process.env.PORT || 3000);
