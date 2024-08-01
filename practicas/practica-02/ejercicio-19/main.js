// Ej 19)
/* Modifica el ejercicio de selección de color para que el cambio sea automático sin necesidad de un botón. 
Use el evento load para asegurarse que al cargar la página el color de fondo coincida con el seleccionado en el select.
*/

// Genero constante del selector
const selector = document.querySelector('#selector')

// Funcion cambiarColor()
function cambiarColor() {
  let colorSeleccionado = selector.value
  document.body.style.backgroundColor = colorSeleccionado
}

// Agrego un eventListener que al hacer click cambie el color
selector.addEventListener('change', cambiarColor)

// Asegura que al cargar la página el color de fondo coincida con el seleccionado en el select
window.addEventListener('load', cambiarColor)
