const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

let preguntas = [];
fs.readFile(path.join(__dirname, '..', 'public', 'preguntas.json'), 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
  } else {
    try {
      preguntas = JSON.parse(data);
      console.log('Preguntas cargadas:', preguntas.length);
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  }
});

let jugadores = [];
let turnoActual = 0;

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // Manejar el registro de los jugadores
  socket.on('registrarJugador', (jugador) => {
    if (jugadores.length < 2) {
      jugadores.push({ id: socket.id, ...jugador });
      io.to(socket.id).emit('registroExitoso', jugadores.length);
      if (jugadores.length === 2) {
        io.emit('iniciarJuego');
      }
    } else {
      socket.emit('juegoLleno');
    }
  });

  // Manejar el lanzamiento del dado
  socket.on('lanzarDado', () => {
    if (jugadores[turnoActual].id === socket.id) {
      const dado = Math.floor(Math.random() * 6) + 1;
      const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
      io.emit('resultadoDado', { jugador: turnoActual + 1, resultado: dado, pregunta });
      turnoActual = (turnoActual + 1) % 2;
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    jugadores = jugadores.filter(j => j.id !== socket.id);
    if (jugadores.length < 2) {
      io.emit('esperarJugador');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
