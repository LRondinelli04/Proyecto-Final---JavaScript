document.addEventListener('DOMContentLoaded', () => {
  const socket = io()

  // Variables del juego
  let jugadorNumero
  let turnoActual = 0
  const posicionesJugadores = [0, 0]
  let color = ''
  let nombre = ''
  let nombreJugador1 = ''
  let nombreJugador2 = ''
  const cantJugadores = []
  const arrayColores = []

  // Constantes de los elementos del DOM
  const btnDado = document.getElementById('btn-dado')
  const btnAbandonar = document.getElementById('btn-abandonar')
  const tablero = document.getElementById('tablero')
  const mensaje = document.getElementById('mensaje')
  const preguntaDiv = document.getElementById('pregunta')
  const respuestasDiv = document.getElementById('respuestas')
  const tituloGanador = document.querySelector('#final')
  const formularioInicio = document.getElementById('formularioInicio')
  const formJugador = document.getElementById('formJugador')
  const nombreJugadorInput = document.getElementById('nombreJugador')
  const colorJugadorInput = document.getElementById('colorJugador')
  const contenidoJuego = document.getElementById('contenidoJuego')

  // Ocultar el contenido del juego inicialmente
  contenidoJuego.style.display = 'none'

  //! FUNCIONES

  // Funcion para crear el tablero
  function crearTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.createElement('div')
      casilla.innerText = i + 1
      casilla.className = 'casilla'
      casilla.id = `casilla-${i}`
      tablero.appendChild(casilla)
      casilla.style.border = '1px solid black'
      casilla.style.borderRadius = '5px'
      casilla.style.fontWeight = '700'
    }
  }

  // Funcion reinicar el tablero al estado inicial (sin jugadores) cuando el juego termina
  function reiniciarTablero() {
    for (let i = 0; i < 20; i++) {
      const casilla = document.getElementById(`casilla-${i}`)
      casilla.style.backgroundColor = ''
      casilla.innerText = i + 1
      casilla.style.fontWeight = '700'
      casilla.style.color = 'black'
      casilla.style.textShadow = 'none'
    }
  }

  // Funcion para actualizar el tablero con las posiciones de los jugadores
  function actualizarTablero() {
    // Reiniciar el tablero antes de actualizar las posiciones de los jugadores
    for (let i = 0; i < 20; i++) {
      const casilla = document.getElementById(`casilla-${i}`)
      casilla.style.backgroundColor = ''
      casilla.innerText = i + 1
      casilla.style.color = 'black'
      casilla.style.textShadow = 'none'
    }

    // Actualizar las posiciones de los jugadores en el tablero
    posicionesJugadores.forEach((pos, index) => {
      let casilla = document.getElementById(`casilla-${pos}`)
      if (pos < 20) {
        casilla.style.backgroundColor = arrayColores[index]
        casilla.style.color = 'white'
        casilla.innerText = `J${index + 1}`
        casilla.style.textShadow =
          '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
      }
    })
  }

  function estilosAPregunta() {
    preguntaDiv.style.fontWeight = 'bold'
    preguntaDiv.style.fontSize = '20px'
    preguntaDiv.style.margin = '10px'
    preguntaDiv.style.textAlign = 'center'
    preguntaDiv.style.textDecoration = 'underline'
  }

  function limpiarMensajes() {
    mensaje.innerText = ''
    mensaje.classList.add('hidden')
    preguntaDiv.innerText = ''
    respuestasDiv.innerHTML = ''
  }

  //! EVENTOS DE SOCKET

  // Registro exitoso del jugador
  socket.on('registroExitoso', (numero) => {
    jugadorNumero = numero
    mensaje.innerText = `Jugador ${numero} registrado. Esperando al otro jugador...`
    // Desabilitar el botón de lanzar dado y abandonar hasta que se conecte el segundo jugador
    btnDado.disabled = true
    btnAbandonar.disabled = true
  })

  // Inicio del juego
  socket.on('iniciarJuego', ({ jugadores, colores }) => {
    // Guardo lo jugadores en un array para mostrar el nombre en el mensaje
    cantJugadores.push(jugadores[0].nombre)
    cantJugadores.push(jugadores[1].nombre)

    // Guardo los colores en un array para mostrar el color en el tablero
    arrayColores.push(colores[0])
    arrayColores.push(colores[1])

    nombreJugador1 = jugadores[1].nombre
    nombreJugador2 = jugadores[0].nombre

    // Mostrar mensaje de inicio de juego y turno del jugador
    mensaje.innerText = `El juego ha comenzado. Es el turno de ${nombreJugador1}!`
    if (jugadorNumero !== 1) {
      mensaje.innerText = `Es el turno de ${nombreJugador2}.`
    }
    actualizarTablero()

    // Habilitar el botón de lanzar dado y abandonar
    btnDado.disabled = false
    btnAbandonar.disabled = false
  })

  // Recibir el resultado del dado
  socket.on(
    'resultadoDado',
    ({ jugador, resultado, pregunta, nuevaPosicion }) => {
      let turno = false
      if (jugador === jugadorNumero) {
        turno = true
        mensaje.innerText = `Obtuviste un ${resultado}. Responde la pregunta para avanzar.`
        mostrarPregunta(pregunta, nuevaPosicion, turno)
      } else {
        mensaje.innerText = `El Jugador ${jugador} obtuvo un ${resultado}. Espera tu turno.`
        mostrarPregunta(pregunta, nuevaPosicion, turno)
      }
    },
  )

  // Mensaje de espera de jugador hasta que se conecte el segundo jugador
  socket.on('esperarJugador', () => {
    mensaje.innerText = 'Esperando al otro jugador...'
  })

  // Actualizar el tablero con las posiciones de los jugadores
  socket.on('actualizarTablero', ({ posiciones, turno, nombreTurno }) => {
    posicionesJugadores[0] = posiciones[0]
    posicionesJugadores[1] = posiciones[1]
    turnoActual = turno - 1
    actualizarTablero()

    console.log('Turno actual: ', nombreTurno.nombre)

    // Mostrar mensaje de turno
    if (jugadorNumero === turno) {
      mensaje.innerText = `¡Es tu turno, ${nombreTurno.nombre}! Tira el dado.`
    } else {
      mensaje.innerText = `Es el turno de ${nombreTurno.nombre}. Espera tu turno.`
    }
  })

  // Evaluar la respuesta del jugador
  socket.on('respuestaEvaluada', ({ correcta, posicionOcupada }) => {
    if (correcta) {
      if (posicionOcupada) {
        mensaje.innerText =
          '¡Respuesta correcta! Sin embargo, la casilla está ocupada. Te quedas en tu casilla actual.'
      } else {
        mensaje.innerText = '¡Respuesta correcta! Avanzas.'
      }
    } else {
      mensaje.innerText =
        'Respuesta incorrecta. Te quedas en tu casilla actual.'
    }
    preguntaDiv.innerText = ''
    respuestasDiv.innerHTML = ''
    // Habilitar el botón de lanzar dado para el siguiente turno
    btnDado.disabled = false
  })

  // Evento para mostrar el ganador del juego y reiniciar el tablero
  socket.on('juegoTerminado', ({ turnoGanador, nombreGanador }) => {
    // Reinicio el tablero y oculto los botones de lanzar dado y abandonar para evitar que el jugador siga jugando
    btnDado.style.display = 'none'
    btnAbandonar.style.display = 'none'
    limpiarMensajes()
    reiniciarTablero()

    if (turnoGanador === 0 && nombreGanador === '') {
      tituloGanador.style.backgroundColor = 'gray'
      tituloGanador.style.color = 'white'
      tituloGanador.innerText = 'Juego Finalizado.'
      setTimeout(() => {
        alert(
          'El juego ha finalizado debido a que uno de los jugadores se ha desconectado.',
        )
        alert('Cierre la página para volver a jugar.')
      }, 500)
    } else {
      // Cambiar el color de fondo del mensaje de ganador según el jugador ganador
      if (turnoGanador == 1) {
        tituloGanador.style.backgroundColor = arrayColores[0]
      } else {
        tituloGanador.style.backgroundColor = arrayColores[1]
      }

      // Mostrar mensaje de ganador
      tituloGanador.style.color = 'white'
      tituloGanador.style.textShadow =
        '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
      tituloGanador.innerText = `${nombreGanador} ha ganado el juego!`
    }

    // cerrar la conexión con el servidor
    socket.close()
  })

  socket.on('reiniciarTablero', () => {
    //Reinicio el tablero para un nuevo juego
    reiniciarTablero()
    // Llamo al evento juegoTerminado
    socket.emit('juegoTerminado', {
      turnoGanador: 0,
      nombreGanador: '',
    })
  })

  //! EVENTOS DE DOM

  // Evento submit del formulario de inicio
  formJugador.addEventListener('submit', function (event) {
    event.preventDefault() // Prevenir el envío estándar del formulario

    // Asignar los valores de nombre y color a partir de los inputs del formulario
    nombre = nombreJugadorInput.value
    color = colorJugadorInput.value

    // Ocultar el formulario y mostrar el contenido del juego
    formularioInicio.style.display = 'none'
    contenidoJuego.style.display = 'block'

    // Emitir el evento de registro del jugador
    socket.emit('registrarJugador', nombre, color)
  })

  // Evento click del botón de "Tirar Dado"
  btnDado.addEventListener('click', () => {
    if (jugadorNumero === turnoActual + 1) {
      socket.emit('lanzarDado')
      // Desabilitar el botón de lanzar dado para evitar que el jugador lance el dado más de una vez
      btnDado.disabled = true
    } else {
      let nombreTurnoActual
      let nombreOtroJugador

      if (turnoActual === 0) {
        nombreTurnoActual = nombreJugador1
        nombreOtroJugador = nombreJugador2
      } else {
        nombreTurnoActual = nombreJugador2
        nombreOtroJugador = nombreJugador1
      }

      mensaje.classList.remove('hidden')
      mensaje.innerText = `No es tu turno. Es el turno de ${nombreOtroJugador}.`
    }
  })

  // Evento click del botón de "Abandonar"
  btnAbandonar.addEventListener('click', () => {
    socket.emit('abandonar', {
      jugador: jugadorNumero,
      cantJugadores: cantJugadores,
    })
    // limpiar el tablero
    reiniciarTablero()
    // limpiar mensajes, preguntas y respuestas
    limpiarMensajes()
  })

  // Función para mostrar la pregunta y las respuestas
  function mostrarPregunta(pregunta, nuevaPosicion, turno) {
    preguntaDiv.innerText = pregunta.pregunta
    estilosAPregunta()
    respuestasDiv.innerHTML = '' // Limpiar respuestas anteriores

    // Mezclar las respuestas
    const respuestasMezcladas = mezclarRespuestas(pregunta.respuestas)

    respuestasMezcladas.forEach((respuesta) => {
      const btn = document.createElement('button')
      btn.innerText = respuesta.texto
      btn.classList.add('btn-respuesta')
      btn.addEventListener('click', () => {
        socket.emit('respuesta', {
          jugador: jugadorNumero,
          correcta: respuesta.correcta,
          nuevaPosicion,
        })
        preguntaDiv.innerText = '' // Ocultar pregunta
        respuestasDiv.innerHTML = '' // Limpiar respuestas
      })
      respuestasDiv.appendChild(btn)
    })

    // Si es el turno del jugador, habilitar los botones de respuesta, de lo contrario, deshabilitarlos
    if (turno) {
      document.querySelectorAll('.btn-respuesta').forEach((btn) => {
        btn.disabled = false
      })
    } else {
      document.querySelectorAll('.btn-respuesta').forEach((btn) => {
        btn.style.display = 'none'
      })
    }
  }

  // Función para mezclar un array
  function mezclarRespuestas(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      // Intercambiar elementos
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  // Crear el tablero al cargar la página
  crearTablero()
})
