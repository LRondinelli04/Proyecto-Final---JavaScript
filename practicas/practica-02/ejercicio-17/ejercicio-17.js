// Constante del boton
const boton = document.querySelector('#boton-mostrar')

// Arreglo de imagenes
const imagenes = []

// Obtener el contenedor de imagenes
const contenedorImagenes = document.querySelector('#imagenes')

// Obtener todos los emenetos <img> dentro del contenedor
const elementosImagenes = contenedorImagenes.querySelectorAll('img')

// Recorrer los elementos y agregar las rutas de imagen al arreglo
elementosImagenes.forEach((img) => {
  imagenes.push(img.src)
})

// Contador de imagenes y largo de array
let contador = 0
const largo = imagenes.length

// Funcion para mostrar la imagen actual
function mostrarImagen() {
  let punteroActual = contador
  let punteroAnterior = contador - 1

  // Corroboro en caso de que sea el primer click
  if (punteroAnterior == -1) {
    // Si es el primer click, el puntero anterior es el ultimo elemento del arreglo
    punteroAnterior = largo - 1
  }

  // Ocultar la imagen anterior
  if (punteroAnterior >= 0) {
    elementosImagenes[punteroAnterior].classList.add('hidden')
  }

  // Mostrar la imagen actual
  elementosImagenes[punteroActual].classList.remove('hidden')
  // Acomodo las imagenes para que sean posibles de ver
  elementosImagenes[punteroActual].style.width = '50px'
  elementosImagenes[punteroActual].style.height = 'auto'

  // Incrementar el contador
  contador++

  // Reiniciar el contador si se llega al final del arreglo
  if (contador >= largo) {
    contador = 0
  }
}

boton.addEventListener('click', mostrarImagen)
