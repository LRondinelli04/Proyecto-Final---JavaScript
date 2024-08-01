/*
? Generar una funcion llamada mostrarInfo() que lo que hace es que mediante al valor que se cargue por teclado en el input, en base a la API https://restcountries.com/v3.1/all se busca el pais ingresado para mostrar sus datos en una lista, si se agrega un nuevo valor de nombre de pais en el input, lo que se debe hacer es eliminar la lista anterior y mostrar la nueva lista con los datos del pais ingresado.

? Para esto se puede utilizar el metodo removeChild
*/

//* Guardo el boton en una constante
const boton = document.querySelector('#boton')

//* Guardo en una constante el input
const input = document.querySelector('input')

//* Genero funcion mostrarInfo()
function mostrarInfo() {
  //* Guardo el valor que se carga por teclado en el input
  let valorInput = input.value

  //* Consulto si en el input hay un valor

  if (valorInput == '') {
    //* Si no hay valor en el input que salte una alerta
    alert('Ingrese un pais')
  } else {
    //*sino que ejecute el codigo

    //* llamo a la API
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
        //* limpio la lista que se encuentra en el html
        list.innerHTML = ''

        //* busco en todos los valores de la API el pais con nombre que coinicda con el valor del input
        const pais = data.find(
          (pais) => pais.name.common.toLowerCase() === valorInput.toLowerCase(),
        )

        //* si el pais no existe que salte una alerta
        if (pais == undefined) {
          alert('El pais no existe')
        } else {
          //* sino que muestre los datos del pais en la lista
          const li = document.createElement('li')
          li.textContent = `Nombre: ${pais.name.common} - Población: ${pais.population} - Capital: ${pais.capital} - Continente: ${pais.region} - Lenguajes: ${Object.values(pais.languages).join(', ')}`
          list.appendChild(li)
        }
      })
  }
}

//* Genero el evento para que al hacer click en el boton se ejecute la funcion mostrarInfo
boton.addEventListener('click', mostrarInfo)
