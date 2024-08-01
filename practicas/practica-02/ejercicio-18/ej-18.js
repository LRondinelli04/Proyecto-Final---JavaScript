// Ej 18)

// Implemente una función que al hacer click en un botón modifique el color de fondo del documento de acuerdo al valor seleccionado.

// Genero constante del boton y el selector
const boton = document.querySelector('#boton')
const selector = document.querySelector('#selector')

// Funcion cambiarColor()
function cambiarColor() {
  let colorSeleccionado = selector.value
  document.body.style.backgroundColor = colorSeleccionado
}

// Agrego un eventListener que al hacer click cambie el color
boton.addEventListener('click', cambiarColor)
