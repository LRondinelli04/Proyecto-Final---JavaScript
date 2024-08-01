let urlBase = 'https://swapi.dev/api'
let currentPage = 1

// Constantes de los botones
const anterior = document.getElementById('anterior')
const siguiente = document.getElementById('siguiente')

// Función para obtener los personajes de Star Wars y mostrarlos en el HTML
function obtenerPersonajesStarWars(page) {
  const endpoint = `/people/?page=${page}`
  const url = urlBase + endpoint

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json()
      }
      throw new Error('Error al obtener los datos')
    })
    .then((data) => {
      const lista = document.getElementById('personajes-lista')

      // Limpiar la lista
      lista.innerHTML = ''

      // Iterar sobre los personajes y agregarlos a la lista
      data.results.forEach((personaje) => {
        const listItem = document.createElement('li')
        listItem.textContent = personaje.name
        listItem.addEventListener('click', () => {
          mostrarDetallePersonaje(personaje)
        })
        lista.appendChild(listItem)
      })

      // Actualizar el número de página actual
      currentPage = page
    })
    .catch((error) => {
      console.error('Error:', error)
    })
}

// Función para mostrar el detalle del personaje seleccionado
function mostrarDetallePersonaje(personaje) {
  const detalleDiv = document.getElementById('detalle-personaje') // Obtener el div donde se mostrará el detalle

  // Limpiar el contenido anterior
  detalleDiv.innerHTML = ''

  // Presentacion del Personaje
  let titulo = document.createElement('h2')
  titulo.innerHTML = `Información de ${personaje.name.toUpperCase()}`
  detalleDiv.appendChild(titulo)

  // Nacimiento
  let nacimiento = document.createElement('span')
  nacimiento.innerHTML = `Año de nacimiento: `
  detalleDiv.appendChild(nacimiento)

  // Año de nacimiento
  let anio = document.createElement('span')
  if (personaje.birth_year.toLowerCase() == 'unknown') {
    anio.innerHTML = 'Desconocido'
  } else {
    anio.innerHTML = personaje.birth_year
  }
  detalleDiv.appendChild(anio)

  // Genero
  let genero = document.createElement('p')
  genero.innerHTML = `Género: ${identificarGenero(personaje)}`
  detalleDiv.appendChild(genero)

  // Películas
  let peliculas = document.createElement('h3')
  peliculas.innerHTML = 'Películas:'
  let listado = document.createElement('ul')
  listado.id = 'peliculas-lista'
  detalleDiv.appendChild(peliculas)
  detalleDiv.appendChild(listado)

  // Iterar sobre las películas y agregarlas a la lista
  personaje.films.forEach((filmUrl) => {
    fetch(filmUrl)
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Error al obtener los datos')
      })
      .then((data) => {
        const listItem = document.createElement('li')
        listItem.textContent = data.title
        listado.appendChild(listItem)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  })
}

function identificarGenero(personaje) {
  if (personaje.gender.toLowerCase() == 'male') {
    return 'Masculino'
  } else if (personaje.gender.toLowerCase() == 'female') {
    return 'Femenino'
  } else {
    return 'N/A'
  }
}

const nPagina = document.querySelector('#nPagina')
nPagina.innerHTML = currentPage

// Manejar el evento click del botón "Anterior"
anterior.addEventListener('click', () => {
  if (currentPage > 1) {
    obtenerPersonajesStarWars(currentPage - 1)
    currentPage--
  } else if (currentPage == 1) {
    currentPage = 9
    obtenerPersonajesStarWars(currentPage)
  }

  nPagina.innerHTML = currentPage
})

// Manejar el evento click del botón "Siguiente"
siguiente.addEventListener('click', () => {
  if (currentPage < 9) {
    obtenerPersonajesStarWars(currentPage + 1)
    currentPage++
  } else if (currentPage == 9) {
    currentPage = 1
    obtenerPersonajesStarWars(currentPage)
  }

  nPagina.innerHTML = currentPage
})

// Llamar a la función para obtener los personajes de Star Wars cuando la página se cargue
window.onload = () => {
  obtenerPersonajesStarWars(currentPage)
}
