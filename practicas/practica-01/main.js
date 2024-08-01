// Ejercicio 2: Hola Mundo! utilizando JavaScript
console.log('Hola Mundo!')

//Ejercicio 3: Agregar un debugger
debugger

/* Ejercicio 4:
1. Cree una variable llamada text con un texto Lorem Ipsum de 5 palabras (puede generarlo desde aquí
(https://es.lipsum.com/#paras)).

2. Cree una función llamada contarCaracteres que reciba un string como parámetro e imprima en la
consola la cantidad de caracteres.

3. Agregue a la función creada anteriormente otro informe en consola con la posición en que comienza la
palabra "ipsum" si es que existe.

4. Imprima en la consola el substring desde la posición 1 a la 4 en mayúsculas.

5. Abra el archivo en el navegador y use las herramientas de desarrollo para ver el resultado.
 */

// Generar una variable "text" con texto lorem de 5 palabras
let text = 'Lorem ipsum dolor sit amet.'

// Crear funcion "contarCaracteres"
function contarCaracteres(texto) {
  // 2) Cuento la cantidad de caracteres que tiene el String recibido
  let caracteres = 0
  caracteres = texto.length
  console.log(
    'La cantidad de caracteres que tiene el texto es de: ',
    caracteres,
  )

  // 3) Informar la posicion en la que comienza la palabra "ipsum"
  let posicionIpsum = text.indexOf('ipsum')
  // Verifico si la palabra "ipsum" se encuentra en el String
  if (posicionIpsum !== -1) {
    console.log(
      'La palabra "ipsum" comienza en el caracter numero: ',
      posicionIpsum + 1,
    )
  } else {
    console.log('La palabra "ipsum" no se encuentra en el texto')
  }
}

// 4)
function imprimir(texto) {
  if (texto.length >= 4) {
    console.log(texto.substring(0, 4).toUpperCase()) //Imprime de la posicion 1 a 4 del texto
  } else {
    console.log(
      'El texto tiene menos de 4 caracteres, por lo tanto no alcanza a imprimir el mensaje',
    )
  }
}

// Llamo a las funciones
contarCaracteres(text)
imprimir(text)

// Ejercicio 5
/* 1. Cree 3 constantes (A, B, y C) con valores numéricos.
2. Cree una función operacionNumerica que realice la operación (A + B) ^ C y la imprima en consola.
3. Utilice Math.random() y Math.floor() para asignar valores dinámicos a A, B, y C.
4. Agregue a la función operacionNumerica la impresión en consola del número más grande de las 3
variables.
5. Abra el archivo en el navegador y use las herramientas de desarrollo para ver el resultado.
 */

// Constantes
const A = Math.floor(1.1)
const B = Math.floor(3.8)
const C = Math.random()

// Funcion
function operacionNumerica(a, b, c) {
  let resultado = (a + b) ** c
  console.log('El resultado de es: ', resultado)
  let numeroMasGrande
  calcularNumeroMasGrande(numeroMasGrande, a, b, c)
}

function calcularNumeroMasGrande(n, a, b, c) {
  if (a > b && a > c) {
    n = a
  } else if (b > a && b > c) {
    n = b
  } else {
    n = c
  }
  console.log('El valor mas alto es: ', n)
}

// Ejecutar Funcion
operacionNumerica(A, B, C)
