/*Desarrolla un carrusel de imágenes simple que los usuarios puedan controlar
con botones de anterior/siguiente.*/

                                    /* Variables */

// Puntero para saber que imagen se esta mostrando
let puntero = 0

// Guardo todas las imagenes 
const imagenes = document.querySelectorAll('#carrusel img')

// Guardo los botones
const anterior = document.querySelector('#ant')
const siguiente = document.querySelector('#sig')

// Guardo la cantidad de imagenes
const cantImagenes = imagenes.length

                                    /* Funciones */
                                    
function mostrarImagen() {
  for (let i = 0; i < cantImagenes; i++) {
    if (i === puntero) {
      imagenes[i].style.display = 'block'
    } else {
      imagenes[i].style.display = 'none'
    }
  }
}

function siguienteImagen() {
  // Si el puntero es mayor a la cantidad de imagenes, se reinicia el puntero
  puntero++
  // Si el puntero es mayor a la cantidad de imagenes, se reinicia el puntero
  if (puntero > cantImagenes - 1) {
    // Se reinicia el puntero
    puntero = 0
  }
  mostrarImagen()
}

function anteriorImagen() {
  // Si el puntero es mayor a la cantidad de imagenes, se reinicia el puntero
  puntero--

  // Si el puntero es menor a 0, se reinicia el puntero
  if (puntero < 0) {
    // Se reinicia el puntero
    puntero = cantImagenes - 1
  }
  mostrarImagen()
}

// Al recargar la pagina quiero que se muestre la primera imagen del carrusel
mostrarImagen()

                                    /* Eventos */

siguiente.addEventListener('click', siguienteImagen)
anterior.addEventListener('click', anteriorImagen)
