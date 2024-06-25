const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

let preguntas = [];
fs.readFile(
  path.join(__dirname, "..", "public", "preguntas.json"),
  "utf-8",
  (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
    } else {
      try {
        preguntas = JSON.parse(data);
        console.log("Preguntas cargadas:", preguntas.length);
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    }
  }
);

let jugadores = [];
let turnoActual = 0;
const posicionesJugadores = [0, 0]; // Posiciones iniciales de los jugadores
const MAX_CASILLAS = 24;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("registrarJugador", (jugador) => {
    if (jugadores.length < 2) {
      jugadores.push({ id: socket.id, ...jugador });
      io.to(socket.id).emit("registroExitoso", jugadores.length);
      if (jugadores.length === 2) {
        io.emit("iniciarJuego", { jugadores });
      }
    } else {
      socket.emit("juegoLleno");
    }
  });

  socket.on("lanzarDado", () => {
    if (jugadores[turnoActual].id === socket.id) {
      const dado = Math.floor(Math.random() * 6) + 1;
      const nuevaPosicion = posicionesJugadores[turnoActual] + dado;

      if (nuevaPosicion >= MAX_CASILLAS) {
        io.emit("juegoTerminado", { ganador: turnoActual + 1 });
        return;
      }

      const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
      io.to(socket.id).emit("resultadoDado", {
        jugador: turnoActual + 1,
        resultado: dado,
        pregunta,
        nuevaPosicion,
      });
    }
  });

  socket.on("respuesta", ({ jugador, correcta, nuevaPosicion }) => {
    if (jugador === turnoActual + 1) {
      const esCorrecta = correcta;
      if (esCorrecta && !posicionesJugadores.includes(nuevaPosicion)) {
        posicionesJugadores[turnoActual] = nuevaPosicion;
        if (posicionesJugadores[turnoActual] >= MAX_CASILLAS) {
          io.emit("juegoTerminado", { ganador: turnoActual + 1 });
          return;
        }
      }
      turnoActual = (turnoActual + 1) % 2;
      io.emit("actualizarTablero", {
        posiciones: posicionesJugadores,
        turno: turnoActual + 1,
      });
      io.to(socket.id).emit("respuestaEvaluada", { correcta: esCorrecta });
    }
  });

  socket.on("abandonar", ({ jugador }) => {
    io.emit("juegoTerminado", { ganador: jugador === 1 ? 2 : 1 });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    jugadores = jugadores.filter((j) => j.id !== socket.id);
    if (jugadores.length < 2) {
      io.emit("esperarJugador");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
