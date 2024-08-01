/*
? Implemente una página HTML que liste al menos 5 datos de los países como el nombre, su población, la capital, el continente, etc. usando la API REST Countries y, por ejemplo, colocando la información como elementos li dentro de un ul.

? Utilizar createElement y appendChild para la solucion
*/
//* https://restcountries.com/v3.1/all

// Guardo en una constante la lista
const list = document.querySelector('#list')

// Variable de estado para controlar qué lista se está mostrando
let mostrandoPaises = false

function cambiarLista() {
  // Solo actualizar la lista si no se están mostrando los países
  if (!mostrandoPaises) {
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
        // limpio la lista que se encuentra en el html
        list.innerHTML = ''

        // recorro el array de objetos y enlisto los nombres, su poblacion, la capital y el continente en el que se encuentran de  5 paises aleatorios en la lista
        for (let i = 0; i < 5; i++) {
          const pais = data[Math.floor(Math.random() * data.length)] // selecciono un pais aleatorio
          const li = document.createElement('li') // creo un elemento li
          li.textContent = `Nombre: ${pais.name.common}, Población: ${pais.population}, Capital: ${pais.capital}, Continente: ${pais.region} - Lengaujes: ${Object.values(pais.languages)}` // le asigno el texto con los datos del pais
          list.appendChild(li) // agrego el elemento li a la lista
        }

        // Actualizar el estado para indicar que se están mostrando los países
        mostrandoPaises = true
      })
  }
}

// Funcion de botones para cambiar de la lista original de Redes a la lista de Paises
const boton = document.querySelector('#cambiarPaises')
const boton2 = document.querySelector('#cambiarRedes')

boton.addEventListener('click', cambiarLista)

// Creo un array con las redes sociales originales de la lista
const redes = ['Google', 'Facebook', 'Twitter', 'Instagram', 'Discord']


// Al apretar el boton vuelve a tener la lista original de la pagina
boton2.addEventListener('click', () => {
  list.innerHTML = ''
  redes.forEach((red) => {
    const li = document.createElement('li')
    li.textContent = red
    list.appendChild(li)
  })

  // Actualizar el estado para indicar que se están mostrando las redes
  mostrandoPaises = false
})
