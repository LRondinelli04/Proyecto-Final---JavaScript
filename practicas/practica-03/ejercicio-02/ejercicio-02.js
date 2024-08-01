/* 
?   Dada la siguiente asignación:
?   var jsonStr = '['
?       + '{"name":"Alice","dob": "2001-03-04T00:00:00.000Z","tri
?       + '{"name":"Robert","dob": "1997-01-31T00:00:00.000Z","tr
?       + '{"name":"Charles","dob": "1978-10-15T00:00:00.000Z","t
?       + '{"name":"Lucía","dob": "1955-08-07T00:00:00.000Z","tri
?       + '{"name":"Peter","dob": "1988-03-09T00:00:00.000Z","tri
?       + '{"name":"Lucas","dob": "1910-12-04T00:00:00.000Z","tri

?  y la función frequentTravelers que sigue:

? function frequentTravelers(people){
?   return people
?     .filter(p => p.trips > 10)
?     .map(p => p.name)
?     .reduce((n1, n2) => n1 + ", " + n2)
? }

?   1. Utilice el objeto JSON para invocar frequentTravelers e imprimir en la consola el resultado que debería ser el que sigue.

? Alice, Charles, Lucía

?Este resultado indica quiénes han viajado más de 10 veces, sugiriendo una mayor huella de carbono debido a la frecuencia de sus viajes.

? 2. Crear una función que imprima en la consola el nombre de la próxima persona en cumplir años.
*/

var jsonStr =
  '[' +
  '{"name":"Alice","dob": "2001-03-04T00:00:00.000Z","trips": 15},' +
  '{"name":"Robert","dob": "1997-01-31T00:00:00.000Z","trips": 5},' +
  '{"name":"Charles","dob": "1978-10-15T00:00:00.000Z","trips": 20},' +
  '{"name":"Lucía","dob": "1955-08-07T00:00:00.000Z","trips": 12},' +
  '{"name":"Peter","dob": "1988-03-09T00:00:00.000Z","trips": 8},' +
  '{"name":"Lucas","dob": "1910-12-04T00:00:00.000Z","trips": 3}]'

var people = JSON.parse(jsonStr)
console.log(people)

function frequentTravelers(people) {
  return people
    .filter((people) => people.trips > 10)
    .map((people) => people.name)
    .reduce((n1, n2) => n1 + ', ' + n2)
}

console.log(frequentTravelers(people))

function nextCumpleanios(people) {
  //* recorrer el array e ir comparando las fechas de cumpleaños de las personas con la fecha actual, el que mas se cercano este a la fecha actual es el proximo cumpleaños

  let fechaActual = new Date() // fecha actual
  let fechaActualMs = fechaActual.getTime() // convertimos la fecha actual a milisegundos

  let proxCumplePersona = people[0] // suponemos que la primera persona es la que cumple años mas cercano
  let proxCumplePersonaMs = new Date(people[0].dob).getTime() // convertimos la fecha de cumpleaños de la primera persona a milisegundos

  people.forEach((person) => {
    // recorremos el array de personas
    let cumplePersonaMs = new Date(person.dob).getTime() // convertimos la fecha de cumpleaños de la persona i a milisegundos

    // si la fecha de cumpleaños de la persona i es mayor a la fecha actual y menor a la fecha de cumpleaños de la persona que suponemos que es la mas cercana
    if (
      cumplePersonaMs > fechaActualMs &&
      cumplePersonaMs < proxCumplePersonaMs
    ) {
      proxCumplePersona = person
      proxCumplePersonaMs = cumplePersonaMs
    }
  })
  console.log(proxCumplePersona.name)
}

console.log(nextCumpleanios(people))
