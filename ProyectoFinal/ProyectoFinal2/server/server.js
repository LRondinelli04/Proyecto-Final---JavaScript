const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

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
const posicionesJugadores = [0, 0];
const MAX_CASILLAS = 20;
const preguntasPorCasilla = [];

function asignarPreguntasACasillas() {
  for (let i = 0; i < MAX_CASILLAS; i++) {
    preguntasPorCasilla[i] = preguntas[i % preguntas.length];
  }
}

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("registrarJugador", (nombreJugador) => {
    if (jugadores.length < 2) {
      jugadores.push({ id: socket.id, ...nombreJugador });
      io.to(socket.id).emit("registroExitoso", jugadores.length);
      if (jugadores.length === 2) {
        asignarPreguntasACasillas();
        io.emit("iniciarJuego", { jugadores });
      }
    } else {
      socket.emit("juegoLleno");
    }
  });

  socket.on("lanzarDado", () => {
    if (jugadores[turnoActual].id === socket.id) {
      const dado = Math.floor(Math.random() * 6) + 1;
      let nuevaPosicion = posicionesJugadores[turnoActual] + dado;

      if (nuevaPosicion >= MAX_CASILLAS) {
        nuevaPosicion = MAX_CASILLAS - 1;
      }

      const pregunta = preguntasPorCasilla[nuevaPosicion];
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

        if (posicionesJugadores[turnoActual] >= MAX_CASILLAS - 1) {
          io.emit("juegoTerminado", {
            ganador: turnoActual + 1,
          });
          return;
        }
      }

      turnoActual = (turnoActual + 1) % 2;
      io.emit("actualizarTablero", {
        posiciones: posicionesJugadores,
        turno: turnoActual + 1,
        nombreTurno: jugadores[turnoActual].nombre
      });
      io.to(socket.id).emit("respuestaEvaluada", { correcta: esCorrecta });
    }
  });

  socket.on("abandonar", ({ jugador }) => {
    io.emit("juegoTerminado", { ganador: jugador === 1 ? 2 : 1 });
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    jugadores = jugadores.filter((j) => j.id !== socket.id);
    if (jugadores.length < 2) {
      io.emit("esperarJugador");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
