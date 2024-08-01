/*
? Basándose en los ejercicios 4 y 5, incorpore un elemento select que permita elegir un dato del país y ordene el listado por ese dato. Por ejemplo si se selecciona Nombre, el listado se debe ordenar por nombre y si se elige Población, por población.
*/

//* Guardo el select en una constante
const select = document.querySelector('#select')

//* Guardo la lista en una constante
const list = document.querySelector('#list')

//* Genero la funcion mostrarInfo()
function mostrarInfo() {
  //* Guardo el valor del select en una constante
  const selectValue = select.value

  //* Genero un array vacio que se va a ir cargando con la informacion de los paises seleccionados de manera random
  let paises = []

  //* llamo a la API
  fetch('https://restcountries.com/v3.1/all')
    .then((response) => response.json())
    .then((data) => {
      //* limpio la lista que se encuentra en el html
      list.innerHTML = ''

      //* voy a imprimir la informacion de manera ordenada de 5 paises random que contiene la API
      for (let i = 0; i < 5; i++) {
        //* selecciono un pais aleatorio
        const pais = data[Math.floor(Math.random() * data.length)]

        //* agrego el pais seleccionado al array paises, pero solamente con su nombre, poblacion y capital
        paises.push({
          name: pais.name,
          population: pais.population,
          capital: pais.capital,
        })
      }

      //* ordeno el array de objetos segun el valor del select
      paises.sort((a, b) => {
        if (selectValue === 'name') {
          //* comparo los valores de name
          return a.name.common.localeCompare(b.name.common)
        } else if (selectValue === 'capital') {
          //* convierto los valores de capital a string para poder compararlos
          const captitalA = (a.capital || '').toString()
          const captitalB = (b.capital || '').toString()

          //* comparo los valores de capital
          return captitalA.localeCompare(captitalB)
        } else if (selectValue === 'population') {
          //* comparo los valores de population
          return a.population - b.population
        }
      })

      //* recorro el array de objetos y enListo los objetos en la lista
      paises.forEach((pais) => {
        const li = document.createElement('li')
        li.textContent = `Nombre: ${pais.name.common}, Población: ${pais.population}, Capital: ${pais.capital}`
        list.appendChild(li)
      })

      //* le remuevo la clase hidden que tiene el ul
      list.classList.remove('hidden')
    })
    //* si hay un error lo muestro en consola
    .catch((error) => console.log(error))
}

//* Genero un addEventListener que al seleccionar un valor del select se ejecute la funcion mostrarInfo
select.addEventListener('change', mostrarInfo)
