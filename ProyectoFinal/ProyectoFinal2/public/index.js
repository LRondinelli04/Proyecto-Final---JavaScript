document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  let jugadorNumero;
  let turnoActual = 0;
  let posiciones = [0, 0]; // Posiciones iniciales de los jugadores

  const btnDado = document.getElementById("btn-dado");
  const mensaje = document.getElementById("mensaje");
  const preguntaDiv = document.getElementById("pregunta");
  const respuestasDiv = document.getElementById("respuestas");

  socket.on("connect", () => {
    const nombre = prompt("Ingrese su nombre:");
    const color = prompt("Ingrese el color de su ficha:");
    socket.emit("registrarJugador", { nombre, color });
  });

  socket.on("registroExitoso", (numero) => {
    jugadorNumero = numero;
    mensaje.innerText = `Jugador ${numero} registrado. Esperando al otro jugador...`;
  });

  socket.on("iniciarJuego", () => {
    mensaje.innerText = "El juego ha comenzado. Es tu turno!";
    if (jugadorNumero !== 1) {
      mensaje.innerText = "Es el turno del Jugador 1.";
    }
  });

  socket.on("resultadoDado", ({ jugador, resultado, pregunta }) => {
    if (jugador === jugadorNumero) {
      mensaje.innerText = `Obtuviste un ${resultado}. Responde la pregunta para avanzar.`;
      mostrarPregunta(pregunta);
    } else {
      mensaje.innerText = `El Jugador ${jugador} obtuvo un ${resultado}. Espera tu turno.`;
    }
  });

  socket.on("esperarJugador", () => {
    mensaje.innerText = "Esperando al otro jugador...";
  });

  btnDado.addEventListener("click", () => {
    socket.emit("lanzarDado");
  });

  function mostrarPregunta(pregunta) {
    preguntaDiv.innerText = pregunta.pregunta;
    respuestasDiv.innerHTML = "";
    const respuestas = [
      pregunta.respuesta,
      pregunta.incorrecta1,
      pregunta.incorrecta2,
    ].sort(() => Math.random() - 0.5);

    respuestas.forEach((respuesta) => {
      const btn = document.createElement("button");
      btn.style.padding = "10px";
      btn.style.margin = "5px";
      btn.style.width = "100%";
      btn.style.backgroundColor = "#f0f0f0";
      btn.style.transition = "all 0.3s";
      btn.onmouseover = () => {
        btn.style.backgroundColor = "#e0e0e0";
        btn.style.cursor = "pointer";
      };
      btn.innerText = respuesta;
      btn.addEventListener("click", () =>
        responderPregunta(respuesta, pregunta.respuesta)
      );
      respuestasDiv.appendChild(btn);
    });
  }

  function responderPregunta(respuestaSeleccionada, respuestaCorrecta) {
    if (respuestaSeleccionada === respuestaCorrecta) {
      mensaje.innerText = "Respuesta correcta! Avanzas a la siguiente casilla.";
      moverJugador(jugadorNumero, resultadoDado);
    } else {
      mensaje.innerText =
        "Respuesta incorrecta. Te quedas en la casilla actual.";
    }
    // Pasar el turno al otro jugador
    turnoActual = (turnoActual + 1) % 2;
    if (turnoActual !== jugadorNumero - 1) {
      mensaje.innerText = `Es el turno del Jugador ${turnoActual + 1}.`;
    }
  }

  function moverJugador(jugador, casillas) {
    const casillaActual = document.getElementById(
      `casilla-${posiciones[jugador - 1]}`
    );
    if (casillaActual) {
      casillaActual.style.backgroundColor = "#f0f0f0"; // Restaurar el color original
    }

    posiciones[jugador - 1] += casillas;
    if (posiciones[jugador - 1] >= 20) {
      mensaje.innerText = `Jugador ${jugador} ha ganado el juego!`;
      return;
    }

    const casillaDestino = document.getElementById(
      `casilla-${posiciones[jugador - 1]}`
    );
    if (casillaDestino) {
      casillaDestino.style.backgroundColor = jugadores[jugador - 1].color;
    }
  }
});
