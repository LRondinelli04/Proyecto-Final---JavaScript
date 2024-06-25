document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  let jugadorNumero;
  let turnoActual = 0;
  let dado;
  const posicionesJugadores = [0, 0];  // Posiciones iniciales de los jugadores
  const jugadores = [];  // Información de los jugadores

  const btnDado = document.getElementById('btn-dado');
  const btnAbandonar = document.getElementById('btn-abandonar');
  const tablero = document.getElementById('tablero');
  const mensaje = document.getElementById('mensaje');
  const preguntaDiv = document.getElementById('pregunta');
  const respuestasDiv = document.getElementById('respuestas');

  function crearTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.createElement('div');
      casilla.className = 'casilla';
      casilla.id = `casilla-${i}`;
      casilla.innerText = i + 1;
      tablero.appendChild(casilla);
    }
  }

  function actualizarTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.getElementById(`casilla-${i}`);
      casilla.style.backgroundColor = ''; // Resetear el color de la casilla
    }
    posicionesJugadores.forEach((pos, index) => {
      const jugador = jugadores[index];
      const casilla = document.getElementById(`casilla-${pos}`);
      casilla.style.backgroundColor = jugador.color;
    });
  }

  socket.on('connect', () => {
    const nombre = prompt('Ingrese su nombre:');
    const color = prompt('Ingrese el color de su ficha:');
    socket.emit('registrarJugador', { nombre, color });
  });

  socket.on('registroExitoso', (numero) => {
    jugadorNumero = numero;
    mensaje.innerText = `Jugador ${numero} registrado. Esperando al otro jugador...`;
  });

  socket.on('iniciarJuego', ({ jugadores: players }) => {
    jugadores.push(...players);
    mensaje.innerText = 'El juego ha comenzado. Es tu turno!';
    if (jugadorNumero !== 1) {
      mensaje.innerText = 'Es el turno del Jugador 1.';
    }
    actualizarTablero();
  });

  socket.on('resultadoDado', ({ jugador, resultado, pregunta, nuevaPosicion }) => {
    if (jugador === jugadorNumero) {
      mensaje.innerText = `Obtuviste un ${resultado}. Responde la pregunta para avanzar.`;
      mostrarPregunta(pregunta, resultado, nuevaPosicion);
    } else {
      mensaje.innerText = `El Jugador ${jugador} obtuvo un ${resultado}. Espera tu turno.`;
    }
  });

  socket.on('esperarJugador', () => {
    mensaje.innerText = 'Esperando al otro jugador...';
  });

  socket.on('actualizarTablero', ({ posiciones, turno }) => {
    posicionesJugadores[0] = posiciones[0];
    posicionesJugadores[1] = posiciones[1];
    turnoActual = turno - 1;
    actualizarTablero();
    mensaje.innerText = `Es el turno del Jugador ${turno}.`;
  });

  socket.on('juegoTerminado', ({ ganador }) => {
    mensaje.innerText = `Jugador ${ganador} ha ganado el juego!`;
    btnDado.disabled = true;
  });

  btnDado.addEventListener('click', () => {
    socket.emit('lanzarDado');
  });

  btnAbandonar.addEventListener('click', () => {
    socket.emit('abandonar', { jugador: jugadorNumero });
  });

  function mostrarPregunta(pregunta, resultado, nuevaPosicion) {
    preguntaDiv.innerText = pregunta.pregunta;
    respuestasDiv.innerHTML = ''; // Limpiar respuestas anteriores
    pregunta.respuestas.forEach((respuesta, index) => {
      const btn = document.createElement('button');
      btn.innerText = respuesta.texto;
      btn.addEventListener('click', () => {
        const correcta = respuesta.correcta;
        socket.emit('respuesta', { jugador: jugadorNumero, correcta, nuevaPosicion });
      });
      respuestasDiv.appendChild(btn);
    });
  }

  crearTablero();
});
