const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dns = require('dns').promises;
const app = express();

app.use(cors());
app.use(express.json());

// Route pour garder le serveur éveillé via Cron-job.org
app.get('/', (req, res) => res.send("NEBULA-X API ONLINE"));

app.post('/api/diagnostic', async (req, res) => {
    const { target } = req.body;
    if (!target) return res.status(400).json({ error: "Cible manquante" });
    const cleanTarget = target.replace(/^https?:\/\//, '').split('/')[0];
    try {
        const start = Date.now();
        const lookup = await dns.lookup(cleanTarget);
        // On fait une petite requête réelle pour tester la cible
        const response = await axios.get(target.startsWith('http') ? target : `http://${target}`, { timeout: 5000 });
        res.json({
            success: true,
            ip: lookup.address,
            latency: (Date.now() - start) + "ms",
            status: response.status
        });
    } catch (e) {
        res.json({ success: false, error: "Host Unreachable" });
    }
});

app.listen(process.env.PORT || 3000);
