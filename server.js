const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const tournaments = [
  { id: 1, game: 'VALORANT',          name: 'NexusGG Spring Cup',   date: '15 Jun 2026', slots: 32, registered: 18, prize: '5.000€' },
  { id: 2, game: 'League of Legends', name: 'NexusGG LoL Open',     date: '20 Jun 2026', slots: 16, registered: 9,  prize: '3.000€' },
  { id: 3, game: 'CS2',               name: 'NexusGG Fragfest',     date: '1 Jul 2026',  slots: 20, registered: 14, prize: '4.000€' },
  { id: 4, game: 'Fortnite',          name: 'NexusGG Battle Open',  date: '10 Jul 2026', slots: 50, registered: 31, prize: '2.000€' },
  { id: 5, game: 'Dota 2',            name: 'NexusGG Grand Series', date: '1 Ago 2026',  slots: 16, registered: 4,  prize: '6.000€' },
];

const registrations = [];

app.get('/api/tournaments', (req, res) => {
  res.json(tournaments);
});

app.post('/api/register', (req, res) => {
  const { name, email, tournamentId } = req.body;

  if (!name || !email || !tournamentId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) {
    return res.status(404).json({ error: 'Torneo no encontrado.' });
  }

  if (tournament.registered >= tournament.slots) {
    return res.status(400).json({ error: 'No quedan plazas disponibles.' });
  }

  const alreadyRegistered = registrations.some(
    r => r.email === email && r.tournamentId === tournamentId
  );
  if (alreadyRegistered) {
    return res.status(400).json({ error: 'Ya estás inscrito en este torneo.' });
  }

  registrations.push({ name, email, tournamentId, date: new Date().toISOString() });
  tournament.registered += 1;

  res.json({ message: `¡Inscripción confirmada en ${tournament.game} — ${tournament.name}!` });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor NexusGG corriendo en http://localhost:${PORT}`);
});