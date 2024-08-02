# Seminario de Lenguajes - JavaScript

## Desarrollo de las practicas y el Trabajo Final Integrador

- Desarrollo de las practicas, con sus ejercicios correspondientes a cada tema, y el proyecto final del seminario de lenguajes de JavaScript (Facultad de Informática UNLP) - Licenciatura en Sistemas.

- Este proyecto se basa en una aplicacion web de Preguntas y Respuestas con una conexion local de 2 personas

## ENUNCIADO DEL PROYECTO FINAL

### Juego de preguntas y respuestas

El trabajo final consiste en el desarrollo de una plantilla para un juego multijugador (mínimo 2) que incluye un tablero con casilleros, un dado, preguntas y respuestas. Las preguntas y respuestas deben estar especificadas en un archivo JSON antes de iniciar la partida. Esto permitirá cambiar el set de preguntas y respuestas en cualquier momento, por ejemplo referidas a accesibilidad Web, a lecto escritura, etc. Para el alcance del trabajo final, con disponer de un conjunto de 20 preguntas y respuestas es suficiente. Al iniciar una partida, las preguntas y respuestas se asocian aleatoriamente a las casillas del tablero.

### Descripción del juego

Se tiene un tablero con un dado, una casilla de entrada, una casilla de salida y 20 casilleros intermedios, cada uno identificado con un número. Cada casillero incluye una pregunta y un conjunto de respuestas posibles con una única respuesta correcta. Gana el jugador que llega primero a la casilla de salida.

### Desarrollo del juego

El juego comienza cuando están los 2 jugadores conectados. Los jugadores eligen su ficha y se ubican en la casilla de entrada (posición inicial). El jugador tira un dado y obtiene un número. Se marca la casilla destino (posición actual + el número del dado) en el tablero y se visualiza la pregunta. El jugador deberá responder la pregunta. Si la responde correctamente, su ficha se mueve en la casilla destino. Si no responde correctamente, su ficha se mantiene en la casilla origen. Si llego a la casilla de salida gana el juego. Sino, le toca el turno al otro jugador y comienza desde el punto 1. **Mientras un jugador juega, el otro jugador puede visualizar el tablero, la pregunta del jugador contrario y no puede tirar el dado.** *Un jugador no puede caer en una casilla ocupada.* El jugador puede abandonar la partida en cualquier momento, dando por ganador al otro jugador. Las preguntas deberán ser aleatorias al momento de iniciar una nueva partida. Si se corta la conexión, se inicia una nueva partida. La ficha de un jugador se identifica por:

- **El nombre del jugador**
- **Color (puede ser elegido una única vez)**
- Cada casilla incluye:
  - **Un número**
  - **Una pregunta en formato texto.**
  - **Como máximo 3 respuestas, con 1 correcta.**
  - Incluir una figura en la pregunta (opcional)
  - Incluir audio en la pregunta (opcional)
  - Incluir una figura en las respuestas (opcional) \* Incluir audio en la respuesta (opcional)

*Toda la lógica del juego deberá resolverse del lado del servidor.*
