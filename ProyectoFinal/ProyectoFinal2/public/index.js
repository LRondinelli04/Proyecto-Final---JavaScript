document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  let jugadorNumero;
  let turnoActual = 0;
  const posicionesJugadores = [0, 0]; // Posiciones iniciales de los jugadores
  const coloresJugadores = ["red", "blue"]; // Colores de los jugadores

  const btnDado = document.getElementById("btn-dado");
  const btnAbandonar = document.getElementById("btn-abandonar");
  const tablero = document.getElementById("tablero");
  const mensaje = document.getElementById("mensaje");
  const preguntaDiv = document.getElementById("pregunta");
  const respuestasDiv = document.getElementById("respuestas");

  function crearTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.createElement("div");
      casilla.className = "casilla";
      casilla.id = `casilla-${i}`;
      tablero.appendChild(casilla);
      casilla.innerHTML = i + 1;
    }
  }

  function actualizarTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.getElementById(`casilla-${i}`);
      casilla.style.backgroundColor = ""; // Resetear el color de la casilla
      casilla.innerText = ""; // Limpiar texto de la casilla
    }

    posicionesJugadores.forEach((pos, index) => {
      if (pos < 20) {
        const casilla = document.getElementById(`casilla-${pos}`);
        casilla.style.backgroundColor = coloresJugadores[index];
        casilla.innerText = `Jugador ${index + 1}`;
      }
    });
  }

  socket.on("connect", () => {
    const nombre = prompt("Ingrese su nombre:");
    const color =
      coloresJugadores.length < 2
        ? prompt("Ingrese el color de su ficha:")
        : coloresJugadores[coloresJugadores.length - 1];
    socket.emit("registrarJugador", { nombre, color });
  });

  socket.on("registroExitoso", (numero) => {
    jugadorNumero = numero;
    mensaje.innerText = `Jugador ${numero} registrado. Esperando al otro jugador...`;
  });

  socket.on("iniciarJuego", ({ jugadores }) => {
    mensaje.innerText = "El juego ha comenzado. Es tu turno!";
    if (jugadorNumero !== 1) {
      mensaje.innerText = "Es el turno del Jugador 1.";
    }
    actualizarTablero();
  });

  socket.on(
    "resultadoDado",
    ({ jugador, resultado, pregunta, nuevaPosicion }) => {
      if (jugador === jugadorNumero) {
        mensaje.innerText = `Obtuviste un ${resultado}. Responde la pregunta para avanzar.`;
        mostrarPregunta(pregunta, nuevaPosicion);
      } else {
        mensaje.innerText = `El Jugador ${jugador} obtuvo un ${resultado}. Espera tu turno.`;
      }
    }
  );

  socket.on("esperarJugador", () => {
    mensaje.innerText = "Esperando al otro jugador...";
  });

  socket.on("actualizarTablero", ({ posiciones, turno }) => {
    posicionesJugadores[0] = posiciones[0];
    posicionesJugadores[1] = posiciones[1];
    turnoActual = turno - 1;
    actualizarTablero();
    mensaje.innerText = `Es el turno del Jugador ${turno}.`;
  });

  socket.on("respuestaEvaluada", ({ correcta }) => {
    if (correcta) {
      mensaje.innerText = "Respuesta correcta! Avanzas.";
    } else {
      mensaje.innerText =
        "Respuesta incorrecta. Te quedas en tu casilla actual.";
    }
    preguntaDiv.innerText = ""; // Ocultar pregunta
    respuestasDiv.innerHTML = ""; // Limpiar respuestas
  });

  socket.on("juegoTerminado", ({ ganador }) => {
    mensaje.innerText = `Jugador ${ganador} ha ganado el juego!`;
    btnDado.disabled = true;
  });

  btnDado.addEventListener("click", () => {
    if (jugadorNumero === turnoActual + 1) {
      socket.emit("lanzarDado");
    } else {
      mensaje.innerText = `Es el turno del Jugador ${turnoActual + 1}.`;
    }
  });

  btnAbandonar.addEventListener("click", () => {
    socket.emit("abandonar", { jugador: jugadorNumero });
  });

  function mostrarPregunta(pregunta, nuevaPosicion) {
    preguntaDiv.innerText = pregunta.pregunta;
    respuestasDiv.innerHTML = ""; // Limpiar respuestas anteriores
    pregunta.respuestas.forEach((respuesta) => {
      const btn = document.createElement("button");
      btn.innerText = respuesta.texto;
      btn.addEventListener("click", () => {
        socket.emit("respuesta", {
          jugador: jugadorNumero,
          correcta: respuesta.correcta,
          nuevaPosicion,
        });
        preguntaDiv.innerText = ""; // Ocultar pregunta
        respuestasDiv.innerHTML = ""; // Limpiar respuestas
      });
      respuestasDiv.appendChild(btn);
    });
  }

  crearTablero();
});
