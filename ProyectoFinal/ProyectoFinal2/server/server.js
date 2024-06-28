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

// fs.readFile lee el archivo preguntas.json y lo almacena en la variable preguntas
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

// Variables para el juego
let jugadores = [];
let turnoActual = 0;
const posicionesJugadores = [0, 0]; // Posiciones iniciales de los jugadores
const MAX_CASILLAS = 20;
const preguntasPorCasilla = []; // Array para almacenar las preguntas por casilla

// Asignar preguntas a casillas
function asignarPreguntasACasillas() {
  for (let i = 0; i < MAX_CASILLAS; i++) {
    preguntasPorCasilla[i] = preguntas[i % preguntas.length];
  }
}

// Conexión de un cliente
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  // Evento para registrar un jugador
  socket.on("registrarJugador", (nombreJugador) => {
    // Si hay menos de dos jugadores, registrar al jugador
    if (jugadores.length < 2) {
      // Agregar jugador a la lista de jugadores
      jugadores.push({ id: socket.id, nombre: nombreJugador.nombre, color: nombreJugador.color });

      // Emitir evento de registro exitoso
      socket.emit("registroExitoso", jugadores.length);

      // Si hay dos jugadores, iniciar el juego
      if (jugadores.length === 2) {
        asignarPreguntasACasillas();
        io.emit("iniciarJuego", { jugadores });
        io.emit("actualizarTablero", { posiciones: posicionesJugadores, turno: turnoActual + 1 });
      }
    }
  });

  // Evento para lanzar el dado
  socket.on("lanzarDado", () => {
    const jugador = jugadores.find((j) => j.id === socket.id);
    const indexJugador = jugadores.indexOf(jugador);
    if (indexJugador !== turnoActual) {
      socket.emit("esperarJugador");
      return;
    }

    const resultadoDado = Math.floor(Math.random() * 6) + 1;
    const nuevaPosicion = Math.min(posicionesJugadores[indexJugador] + resultadoDado, MAX_CASILLAS - 1);
    posicionesJugadores[indexJugador] = nuevaPosicion;

    const pregunta = preguntasPorCasilla[nuevaPosicion];

    io.emit("resultadoDado", { jugador: indexJugador + 1, resultado: resultadoDado, pregunta, nuevaPosicion });
  });

  // Evento para evaluar la respuesta
  socket.on("respuesta", ({ jugador, correcta, nuevaPosicion }) => {
    if (correcta) {
      posicionesJugadores[jugador - 1] = nuevaPosicion;
      turnoActual = (turnoActual + 1) % 2;
      io.emit("actualizarTablero", { posiciones: posicionesJugadores, turno: turnoActual + 1 });
    }

    io.emit("respuestaEvaluada", { correcta });

    // Verificar si el jugador ha ganado
    if (posicionesJugadores[jugador - 1] >= MAX_CASILLAS - 1) {
      io.emit("juegoTerminado", { ganador: jugador });
      jugadores = [];
      posicionesJugadores.fill(0); // Resetear posiciones
      turnoActual = 0; // Resetear turno
    }
  });

  // Evento para desconexión de un cliente
  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    jugadores = jugadores.filter((jugador) => jugador.id !== socket.id);
    if (jugadores.length < 2) {
      io.emit("esperarJugador");
    }
  });

  socket.on("abandonar", ({ jugador }) => {
    console.log(`Jugador ${jugador} ha abandonado el juego.`);
    jugadores = [];
    posicionesJugadores.fill(0); // Resetear posiciones
    turnoActual = 0; // Resetear turno
    io.emit("esperarJugador");
  });
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
