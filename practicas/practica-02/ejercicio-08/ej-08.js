// Implementa una función que calcula el total de una lista de compras.

function total(prices, amounts) {
  // Inicializamos la variable total
  let total = 0
  // Recorremos el objeto prices y multiplicamos el precio por la cantidad en el objeto amount
  for (let i = 0; i < Object.keys(prices).length; i++) {
    total += prices[Object.keys(prices)[i]] * amounts[Object.keys(prices)[i]]
  }
  // Devolvemos el total
  return total
}

// Verifique qué devuelven las siguientes expresiones:
let prices = {
  MILK: 48.9,
  BREAD: 90.5,
  BUTTER: 130.12,
}

let amounts = {
  MILK: 1,
  BREAD: 0.5,
  BUTTER: 0.2,
}

console.log(typeof prices)
console.log(prices.BREAD)
console.log(amounts['MILK'])

console.log(`El precio total de la lista de compras es de: $${total(prices, amounts)}`) // Devuelve 120.174
