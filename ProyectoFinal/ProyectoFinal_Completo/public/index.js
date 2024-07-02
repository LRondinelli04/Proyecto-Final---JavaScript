document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Variables del juego
  let jugadorNumero;
  let turnoActual = 0;
  let valorDados = 0;
  const posicionesJugadores = [0, 0];

  let nombre = "";
  let color = "";

  let nombreJugador1 = "";
  let nombreJugador2 = "";
  const cantJugadores = [];

  // Constantes de los elementos del DOM
  const btnDado = document.getElementById("btn-dado");
  const btnAbandonar = document.getElementById("btn-abandonar");
  const tablero = document.getElementById("tablero");
  const mensaje = document.getElementById("mensaje");
  const preguntaDiv = document.getElementById("pregunta");
  const respuestasDiv = document.getElementById("respuestas");
  const tituloGanador = document.querySelector("#final");

  // Funcion para crear el tablero
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

  // Funcion para actualizar el tablero con las posiciones de los jugadores
  function actualizarTablero() {
    // Reiniciar el tablero antes de actualizar las posiciones de los jugadores
    for (let i = 0; i < 20; i++) {
      const casilla = document.getElementById(`casilla-${i}`);
      casilla.style.backgroundColor = "";
      casilla.innerText = i + 1;
    }

    // Actualizar las posiciones de los jugadores en el tablero
    posicionesJugadores.forEach((pos, index) => {
      let casilla = document.getElementById(`casilla-${pos}`);
      if (pos < 20) {
        posAnterior = posActual - valorDados + 1;
        casilla.style.backgroundColor = jugadores[index].color;
        casilla.innerText = `J${index + 1}`;
      }
    });
  }

  //! EVENTOS DE SOCKET

  // Conexion al servidor
  socket.on("connect", () => {
    nombre = prompt("Ingrese su nombre:");
    color = prompt(
      "Ingrese su color (rojo, azul, amarillo, verde):"
    ).toLowerCase();
    socket.emit("registrarJugador", { nombre, color });
  });

  // Registro exitoso del jugador
  socket.on("registroExitoso", (numero) => {
    jugadorNumero = numero;
    mensaje.innerText = `Jugador ${numero} registrado. Esperando al otro jugador...`;
  });

  // Inicio del juego
  socket.on("iniciarJuego", ({ jugadores }) => {
    // Si el nombre del jugador es "" (vacio) se le asigna nombre "Jugador 1" o "Jugador 2"
    asignarNombre(jugadores);

    // Guardo lo jugadores en un array para mostrar el nombre en el mensaje
    cantJugadores.push(jugadores[0].nombre);
    cantJugadores.push(jugadores[1].nombre);

    nombreJugador1 = jugadores[1].nombre;
    nombreJugador2 = jugadores[0].nombre;

    // Mostrar mensaje de inicio de juego y turno del jugador
    mensaje.innerText = `El juego ha comenzado. Es el turno de ${nombreJugador1}!`;
    if (jugadorNumero !== 1) {
      mensaje.innerText = `Es el turno de ${nombreJugador2}.`;
    }
    actualizarTablero();
  });

  // Recibir el resultado del dado
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

  // Mensaje de espera de jugador hasta que se conecte el segundo jugador
  socket.on("esperarJugador", () => {
    mensaje.innerText = "Esperando al otro jugador...";
  });

  // Actualizar el tablero con las posiciones de los jugadores
  socket.on("actualizarTablero", ({ posiciones, turno, nombreTurno }) => {
    posicionesJugadores[0] = posiciones[0];
    posicionesJugadores[1] = posiciones[1];
    turnoActual = turno - 1;
    actualizarTablero();

    // Mostrar mensaje de turno
    if (jugadorNumero === turno) {
      mensaje.innerText = `Es tu turno, ${nombreTurno}! Tira el dado.`;
    } else {
      mensaje.innerText = `Es el turno de ${nombreTurno}. Espera tu turno.`;
    }
  });

  // Evaluar la respuesta del jugador
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

  // Evento para mostrar el ganador del juego y reiniciar el tablero
  socket.on("juegoTerminado", ({ turnoGanador, nombreGanador }) => {
    // Reinicio el tablero y oculto los botones de lanzar dado y abandonar para evitar que el jugador siga jugando
    btnDado.style.display = "none";
    btnAbandonar.style.display = "none";
    mensaje.innerText = "";
    preguntaDiv.innerText = "";
    mensaje.classList.add("hidden");
    reiniciarTablero();

    // Cambiar el color de fondo del mensaje de ganador según el jugador ganador
    tituloGanador.style.backgroundColor = jugadores[turnoGanador - 1].color;

    // Mostrar mensaje de ganador
    tituloGanador.innerText = `${nombreGanador} ha ganado el juego!`;
  });

  //! EVENTOS DE DOM

  // Evento click del botón de "Tirar Dado"
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

      mensaje.classList.remove("hidden");
      mensaje.innerText = `No es tu turno. Es el turno de ${nombreOtroJugador}.`;
    }
  });

  // Evento click del botón de "Abandonar"
  btnAbandonar.addEventListener("click", () => {
    socket.emit("abandonar", {
      jugador: jugadorNumero,
      cantJugadores: cantJugadores,
    });
    // limpiar el tablero
    reiniciarTablero();
    // limpiar mensajes, preguntas y respuestas
    mensaje.innerText = "";
    mensaje.classList.add("hidden");
    preguntaDiv.innerText = "";
    respuestasDiv.innerHTML = "";
  });

  // Función para mostrar la pregunta y las respuestas
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
      // Intercambiar elementos
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Crear el tablero al cargar la página
  crearTablero();
});
