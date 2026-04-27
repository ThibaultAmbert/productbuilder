const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const players = new Map();
let phase = 'lobby';

const publicState = () => ({
  phase,
  players: [...players.values()].map(p => ({
    id: p.id,
    name: p.name,
    ready: p.ready,
  })),
});

const revealState = () => {
  const all = [...players.values()];
  return all.map(target => {
    const guessers = all
      .filter(p => p.id !== target.id)
      .map(guesser => ({
        id: guesser.id,
        name: guesser.name,
        guess: guesser.guesses[target.id] || null,
        correct: guesser.guesses[target.id] === target.sign,
      }));
    const myScore = all
      .filter(p => p.id !== target.id)
      .filter(p => {
        const targetPlayer = players.get(target.id);
        return targetPlayer && targetPlayer.guesses[p.id] === p.sign;
      }).length;
    return { id: target.id, name: target.name, sign: target.sign, guessers, myScore };
  });
};

io.on('connection', socket => {
  socket.emit('state', publicState());

  socket.on('join', ({ name, sign }) => {
    if (phase !== 'lobby') return socket.emit('err', 'La partie est déjà en cours.');
    const nameTaken = [...players.values()].some(
      p => p.name.toLowerCase() === name.toLowerCase()
    );
    if (nameTaken) return socket.emit('err', 'Ce prénom est déjà pris.');
    players.set(socket.id, { id: socket.id, name, sign, guesses: {}, ready: false });
    io.emit('state', publicState());
  });

  socket.on('start', () => {
    if (players.size < 2) return socket.emit('err', 'Il faut au moins 2 joueurs pour commencer.');
    phase = 'guessing';
    io.emit('state', publicState());
  });

  socket.on('guess', ({ targetId, sign }) => {
    const p = players.get(socket.id);
    if (!p || phase !== 'guessing') return;
    p.guesses[targetId] = sign;
  });

  socket.on('ready', () => {
    const p = players.get(socket.id);
    if (!p) return;
    p.ready = true;
    io.emit('state', publicState());
    if ([...players.values()].every(p => p.ready)) {
      phase = 'reveal';
      io.emit('reveal', revealState());
    }
  });

  socket.on('forceReveal', () => {
    phase = 'reveal';
    io.emit('reveal', revealState());
  });

  socket.on('reset', () => {
    phase = 'lobby';
    players.clear();
    io.emit('state', publicState());
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    if (players.size === 0) phase = 'lobby';
    io.emit('state', publicState());
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Zodiac Game → http://localhost:${PORT}`));
