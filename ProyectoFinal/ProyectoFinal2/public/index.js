document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  let jugadorNumero;
  let turnoActual = 0;
  let valorDados = 0;
  const posicionesJugadores = [0, 0];
  const coloresJugadores = ["red", "blue"];
  let nombre = "";
  let nombreJugador1 = "";
  let nombreJugador2 = "";

  const btnDado = document.getElementById("btn-dado");
  const btnAbandonar = document.getElementById("btn-abandonar");
  const tablero = document.getElementById("tablero");
  const mensaje = document.getElementById("mensaje");
  const preguntaDiv = document.getElementById("pregunta");
  const respuestasDiv = document.getElementById("respuestas");
  const tituloGanador = document.querySelector("#final");

  function crearTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.createElement("div");
      casilla.innerText = i + 1;
      casilla.className = "casilla";
      casilla.id = `casilla-${i}`;
      tablero.appendChild(casilla);
      casilla.style.border = "1px solid black";
      casilla.style.borderRadius = "5px";
    }
  }

  function reiniciarTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.getElementById(`casilla-${i}`);
      casilla.style.backgroundColor = "";
      casilla.innerText = i + 1;
    }
  }

  function actualizarTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.getElementById(`casilla-${i}`);
      casilla.style.backgroundColor = "";
      casilla.innerText = i + 1;
    }

    posicionesJugadores.forEach((pos, index) => {
      let casilla = document.getElementById(`casilla-${pos}`);
      const casillaAnterior = null;
      let posActual = pos;
      let posAnterior = 0;
      if (pos < 20) {
        posAnterior = posActual - valorDados + 1;
        casilla.style.backgroundColor = coloresJugadores[index];
        casilla.innerText = `J${index + 1}`;
        posActual = pos + 1;
        console.log(
          `Posicion anterior del jugador ${
            index + 1
          }: ${posAnterior}, Posicion actual del jugador ${
            index + 1
          }: ${posActual}`
        );
      }
    });
  }

  socket.on("connect", () => {
    nombre = prompt("Ingrese su nombre:");
    socket.emit("registrarJugador", { nombre });
  });

  socket.on("registroExitoso", (numero) => {
    jugadorNumero = numero;
    mensaje.innerText = `Jugador ${numero} registrado. Esperando al otro jugador...`;
  });

  socket.on("iniciarJuego", ({ jugadores }) => {

    // imprimir en consola los jugadores
    console.log(jugadores[0].nombre);
    console.log(jugadores[1].nombre);


    nombreJugador1 = jugadores[1].nombre;
    nombreJugador2 = jugadores[0].nombre;
    mensaje.innerText = `El juego ha comenzado. Es el turno de ${nombreJugador1}!`;
    if (jugadorNumero !== 1) {
      mensaje.innerText = `Es el turno de ${nombreJugador1}.`;
    }
    actualizarTablero();
  });

  socket.on(
    "resultadoDado",
    ({ jugador, resultado, pregunta, nuevaPosicion }) => {
      if (jugador === jugadorNumero) {
        mensaje.innerText = `Obtuviste un ${resultado}. Responde la pregunta para avanzar.`;
        valorDados = resultado;
        mostrarPregunta(pregunta, nuevaPosicion);
      } else {
        mensaje.innerText = `El Jugador ${jugador} obtuvo un ${resultado}. Espera tu turno.`;
      }
    }
  );

  socket.on("esperarJugador", () => {
    mensaje.innerText = "Esperando al otro jugador...";
  });

  socket.on("actualizarTablero", ({ posiciones, turno, nombreTurno }) => {
    posicionesJugadores[0] = posiciones[0];
    posicionesJugadores[1] = posiciones[1];
    turnoActual = turno - 1;
    actualizarTablero();
    mensaje.innerText = `Es el turno de ${nombreTurno}.`;
  });

  socket.on("respuestaEvaluada", ({ correcta }) => {
    if (correcta) {
      mensaje.innerText = "Respuesta correcta! Avanzas.";
    } else {
      mensaje.innerText =
        "Respuesta incorrecta. Te quedas en tu casilla actual.";
    }
    preguntaDiv.innerText = "";
    respuestasDiv.innerHTML = "";
  });

  socket.on("juegoTerminado", ({ ganador }) => {
    btnDado.style.display = "none";
    btnAbandonar.style.display = "none";
    mensaje.innerText = "";
    preguntaDiv.innerText = "";

    reiniciarTablero();

    if (ganador == 1) {
      tituloGanador.style.backgroundColor = coloresJugadores[0];
      tituloGanador.innerText = `Jugador ${ganador} ha ganado el juego!`;
    } else {
      tituloGanador.style.backgroundColor = coloresJugadores[1];
      tituloGanador.innerText = `Jugador ${ganador} ha ganado el juego!`;
    }
  });

  btnDado.addEventListener("click", () => {
    if (jugadorNumero === turnoActual + 1) {
      socket.emit("lanzarDado");
    } else {
      let nombreTurnoActual;
      let nombreOtroJugador;

      if (turnoActual === 0) {
        nombreTurnoActual = nombreJugador1;
        nombreOtroJugador = nombreJugador2;
      } else {
        nombreTurnoActual = nombreJugador2;
        nombreOtroJugador = nombreJugador1;
      }

      mensaje.innerText = `No es tu turno. Es el turno de ${nombreOtroJugador}.`;
    }
  });

  btnAbandonar.addEventListener("click", () => {
    socket.emit("abandonar", { jugador: jugadorNumero });
  });

  function mostrarPregunta(pregunta, nuevaPosicion) {
    preguntaDiv.innerText = pregunta.pregunta;
    respuestasDiv.innerHTML = "";
    pregunta.respuestas.forEach((respuesta) => {
      const btn = document.createElement("button");
      btn.innerText = respuesta.texto;
      btn.addEventListener("click", () => {
        socket.emit("respuesta", {
          jugador: jugadorNumero,
          correcta: respuesta.correcta,
          nuevaPosicion,
        });
        preguntaDiv.innerText = "";
        respuestasDiv.innerHTML = "";
      });
      respuestasDiv.appendChild(btn);
    });
  }

  crearTablero();
});
