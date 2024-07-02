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

// Variables para el juego
let jugadores = [];
let turnoActual = 0;
const posicionesJugadores = [0, 0];
const MAX_CASILLAS = 20;
const preguntasPorCasilla = [];

// Función para asignar preguntas a las casillas de manera aleatoria
function asignarPreguntasACasillas() {
  // Reiniciar el array de preguntas por casilla
  preguntasPorCasilla.length = 0;

  // Copiar las preguntas disponibles para no modificar el arreglo original
  const preguntasDisponibles = [...preguntas];

  for (let i = 0; i < MAX_CASILLAS; i++) {
    if (preguntasDisponibles.length === 0) {
      break; // En caso de que no haya suficientes preguntas
    }

    // Seleccionar una pregunta aleatoria y agregarla a la lista de preguntas por casilla
    const index = Math.floor(Math.random() * preguntasDisponibles.length);
    preguntasPorCasilla.push(preguntasDisponibles[index]);
    preguntasDisponibles.splice(index, 1);
  }
}

//! CODIGO SERVER-SIDE

// Evento de conexión de un cliente
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  // Evento para registrar un jugador
  socket.on("registrarJugador", (nombreJugador) => {
    // Si hay menos de dos jugadores, registrar al jugador
    if (jugadores.length < 2) {
      // Si el nombre del jugador es "" (vacio) se le asigna nombre "Jugador 1" o "Jugador 2"
      if (
        nombreJugador.nombre === "" ||
        nombreJugador.nombre === null ||
        nombreJugador.nombre === undefined
      ) {
        nombreJugador.nombre =
          jugadores.length === 0 ? "Jugador 1" : "Jugador 2";
      }
      // Agregar jugador a la lista de jugadores
      jugadores.push({ id: socket.id, ...nombreJugador });
      io.to(socket.id).emit("registroExitoso", jugadores.length);
      // Si hay dos jugadores, iniciar el juego
      if (jugadores.length === 2) {
        // Asignar preguntas a casillas
        asignarPreguntasACasillas();
        // Enviar evento a ambos jugadores para iniciar el juego
        io.emit("iniciarJuego", { jugadores });
        // Enviar evento al cliente para actualizar el tablero con los nombres de los jugadores y el turno actual
        io.emit("actualizarTablero", {
          posiciones: posicionesJugadores,
          turno: turnoActual + 1,
          nombreTurno: jugadores[turnoActual].nombre,
        });
      }
    } else {
      // Enviar evento al cliente para indicar que el juego está lleno
      socket.emit("juegoLleno");
    }
  });

  // Evento para lanzar el dado
  socket.on("lanzarDado", () => {
    if (jugadores[turnoActual].id === socket.id) {
      const dado = Math.floor(Math.random() * 6) + 1;
      let nuevaPosicion = posicionesJugadores[turnoActual] + dado;

      if (nuevaPosicion >= MAX_CASILLAS) {
        nuevaPosicion = MAX_CASILLAS - 1;
      }

      const pregunta = preguntasPorCasilla[nuevaPosicion];
      // Enviar evento al cliente con el resultado del dado
      io.to(socket.id).emit("resultadoDado", {
        jugador: turnoActual + 1,
        resultado: dado,
        pregunta,
        nuevaPosicion,
      });
    }
  });

  // Evento para responder una pregunta
  socket.on("respuesta", ({ jugador, correcta, nuevaPosicion }) => {
    if (jugador === turnoActual + 1) {
      const esCorrecta = correcta;
      if (esCorrecta && !posicionesJugadores.includes(nuevaPosicion)) {
        posicionesJugadores[turnoActual] = nuevaPosicion;

        if (posicionesJugadores[turnoActual] >= MAX_CASILLAS - 1) {
          // Enviar evento al cliente para indicar que el juego ha terminado
          io.emit("juegoTerminado", {
            turnoGanador: turnoActual + 1,
            nombreGanador: jugadores[turnoActual].nombre,
          });
          return;
        }
      }

      turnoActual = (turnoActual + 1) % 2;
      // Enviar evento al cliente para actualizar el tablero con las nuevas posiciones y el turno actual
      io.emit("actualizarTablero", {
        posiciones: posicionesJugadores,
        turno: turnoActual + 1,
        nombreTurno: jugadores[turnoActual].nombre,
      });
      // Enviar evento al cliente con la respuesta evaluada
      io.to(socket.id).emit("respuestaEvaluada", { correcta: esCorrecta });
    }
  });

  // Evento para abandonar el juego
  socket.on("abandonar", ({ jugador, cantJugadores }) => {
    // Cuando un jugador abandona, se envía un evento al cliente para indicar que el juego ha terminado
    io.emit("juegoTerminado", {
      turnoGanador: jugador === 1 ? 2 : 1,
      nombreGanador: cantJugadores[jugador === 1 ? 1 : 0],
    });
  });

  // Evento de desconexión de un cliente para mostrar mensaje en consola
  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    jugadores = jugadores.filter((j) => j.id !== socket.id);
    if (jugadores.length < 2) {
      io.emit("esperarJugador");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto: ${PORT}`);
});
