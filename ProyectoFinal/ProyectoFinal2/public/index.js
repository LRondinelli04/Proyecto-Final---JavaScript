document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
  
    let jugadorNumero;
    let turnoActual = 0;
  
    const btnDado = document.getElementById('btn-dado');
    const tablero = document.getElementById('tablero');
    const mensaje = document.getElementById('mensaje');
  
    socket.on('connect', () => {
      const nombre = prompt('Ingrese su nombre:');
      const color = prompt('Ingrese el color de su ficha:');
      socket.emit('registrarJugador', { nombre, color });
    });
  
    socket.on('registroExitoso', (numero) => {
      jugadorNumero = numero;
      mensaje.innerText = `Jugador ${numero} registrado. Esperando al otro jugador...`;
    });
  
    socket.on('iniciarJuego', () => {
      mensaje.innerText = 'El juego ha comenzado. Es tu turno!';
      if (jugadorNumero !== 1) {
        mensaje.innerText = 'Es el turno del Jugador 1.';
      }
    });
  
    socket.on('resultadoDado', ({ jugador, resultado }) => {
      if (jugador === jugadorNumero) {
        mensaje.innerText = `Obtuviste un ${resultado}. Responde la pregunta para avanzar.`;
        // Aquí deberías mostrar la pregunta al jugador
      } else {
        mensaje.innerText = `El Jugador ${jugador} obtuvo un ${resultado}. Espera tu turno.`;
      }
    });
  
    socket.on('esperarJugador', () => {
      mensaje.innerText = 'Esperando al otro jugador...';
    });
  
    btnDado.addEventListener('click', () => {
      socket.emit('lanzarDado');
    });
  });
  