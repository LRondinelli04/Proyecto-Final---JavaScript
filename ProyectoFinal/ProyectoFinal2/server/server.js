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
  socket.on("registrarJugador", (jugador) => {
    // Si hay menos de dos jugadores, registrar al jugador
    if (jugadores.length < 2) {
      // Agregar jugador a la lista de jugadores
      jugadores.push({ id: socket.id, ...jugador });
      io.to(socket.id).emit("registroExitoso", jugadores.length);
      // Si hay dos jugadores, iniciar el juego
      if (jugadores.length === 2) {
        // Asignar preguntas a casillas
        asignarPreguntasACasillas();
        // Enviar evento a ambos jugadores para iniciar el juego
        io.emit("iniciarJuego", { jugadores });
      }
    } else {
      // Enviar evento al cliente para indicar que el juego está lleno
      socket.emit("juegoLleno");
    }
  });

  // Evento para lanzar el dado
  socket.on("lanzarDado", () => {
    // Verificar si el jugador actual es el que lanzó el dado
    if (jugadores[turnoActual].id === socket.id) {
      // Generar un número aleatorio entre 1 y 6 (DADO)
      const dado = Math.floor(Math.random() * 6) + 1;
      // Calcula la nueva posicion del jugador actual en el tablero sumando el resultado del dado
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

  // Evento para responder la pregunta
  socket.on("respuesta", ({ jugador, correcta, nuevaPosicion }) => {
    // Verificar si el jugador que responde es el que tiene el turno
    if (jugador === turnoActual + 1) {
      const esCorrecta = correcta;
      // Si la respuesta es correcta y la nueva posición no está ocupada por otro jugador
      if (esCorrecta && !posicionesJugadores.includes(nuevaPosicion)) {
        posicionesJugadores[turnoActual] = nuevaPosicion;
        // Verificar si el jugador ha llegado a la casilla final
        if (posicionesJugadores[turnoActual] >= MAX_CASILLAS - 1) {
          io.emit("juegoTerminado", { ganador: turnoActual + 1 });
          return;
        }
      }

      // Cambiar el turno al siguiente jugador
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
