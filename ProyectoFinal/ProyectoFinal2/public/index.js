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
  const cantJugadores = [];

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

  // Funcion reinicar el tablero al estado inicial (sin jugadores) cuando el juego termina
  function reiniciarTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.getElementById(`casilla-${i}`);
      casilla.style.backgroundColor = "";
      casilla.innerText = i + 1;
    }
  }

  // Funcion para asignar nombre a los jugadores en caso de que sea vacio
  function asignarNombre(jugadores) {
    if (
      jugadores[0].nombre === "" ||
      jugadores[0].nombre === null ||
      jugadores[0].nombre === undefined
    ) {
      jugadores[0].nombre = "Jugador 1";
    }
    if (
      jugadores[1].nombre === "" ||
      jugadores[1].nombre === null ||
      jugadores[1].nombre === undefined
    ) {
      jugadores[1].nombre = "Jugador 2";
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
    // Si el nombre del jugador es "" (vacio) se le asigna nombre "Jugador 1" o "Jugador 2"
    asignarNombre(jugadores);

    // imprimir en consola los jugadores
    console.log(jugadores[0].nombre);
    console.log(jugadores[1].nombre);

    cantJugadores.push(jugadores[0].nombre);
    cantJugadores.push(jugadores[1].nombre);

    nombreJugador1 = jugadores[1].nombre;
    nombreJugador2 = jugadores[0].nombre;
    mensaje.innerText = `El juego ha comenzado. Es el turno de ${nombreJugador1}!`;
    if (jugadorNumero !== 1) {
      mensaje.innerText = `Es el turno de ${nombreJugador2}.`;
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
    if (jugadorNumero === turno) {
      mensaje.innerText = `Es tu turno, ${nombreTurno}! Lanza el dado.`;
    } else {
      mensaje.innerText = `Es el turno de ${nombreTurno}. Espera tu turno.`;
    }
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
    // Habilitar el botón de lanzar dado para el siguiente turno
    btnDado.disabled = false;
  });

  socket.on("juegoTerminado", ({ turnoGanador, nombreGanador }) => {
    btnDado.style.display = "none";
    btnAbandonar.style.display = "none";
    mensaje.innerText = "";
    preguntaDiv.innerText = "";

    reiniciarTablero();

    if (turnoGanador == 1) {
      tituloGanador.style.backgroundColor = coloresJugadores[0];
    } else {
      tituloGanador.style.backgroundColor = coloresJugadores[1];
    }

    tituloGanador.innerText = `${nombreGanador} ha ganado el juego!`;
  });

  btnDado.addEventListener("click", () => {
    if (jugadorNumero === turnoActual + 1) {
      socket.emit("lanzarDado");
      // Desabilitar el botón de lanzar dado para evitar que el jugador lance el dado más de una vez
      btnDado.disabled = true;
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
    socket.emit("abandonar", {
      jugador: jugadorNumero,
      cantJugadores: cantJugadores,
    });
    // limpiar el tablero
    reiniciarTablero();
    // limpiar mensajes, preguntas y respuestas
    mensaje.innerText = "";
    preguntaDiv.innerText = "";
    respuestasDiv.innerHTML = "";
  });

  function mostrarPregunta(pregunta, nuevaPosicion) {
    preguntaDiv.innerText = pregunta.pregunta;
    respuestasDiv.innerHTML = ""; // Limpiar respuestas anteriores

    // Mezclar las respuestas
    const respuestasMezcladas = mezclarRespuestas(pregunta.respuestas);

    respuestasMezcladas.forEach((respuesta) => {
      const btn = document.createElement("button");
      btn.innerText = respuesta.texto;
      btn.classList.add("btn-respuesta");
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

  // Función para mezclar un array
  function mezclarRespuestas(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  crearTablero();
});
