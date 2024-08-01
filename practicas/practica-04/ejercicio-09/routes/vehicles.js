const express = require('express')
const fs = require('fs')
const router = express.Router()

//* RUTAS Y FUNCIONES GENERALES PARA LOS VEHICULOS
//? Ruta al archivo de los vehiculos
const vehiclesPath = './vehicles.json'
//? Funcion para leer los datos de los vehiculos
const datosDelVehicle = () => {
  const data = fs.readFileSync(vehiclesPath)
  return JSON.parse(data)
}
//? Funcion para escribir los datos de los vehiculos
const mostrarDatosVehicle = (data) => {
  fs.writeFileSync(vehiclesPath, JSON.stringify(data, null, 2))
}

//* ENDPOINTS PARA ACCEDER A LA INFORMACION DE LOS VEHICULOS
//! Endpoint para la distancia total
router.get('/distanciaTotal', (req, res) => {
  const vehicles = datosDelVehicle()
  const distanciaTotal = vehicles.reduce(
    (acc, vehicle) => acc + vehicle.distance,
    0,
  )
  res.json({ distanciaTotal })
})

//! Endpoint para la Distancia Promedio por TIPO de VEHICULO
router.get('/distanciaPromedio', (req, res) => {
  // Se lee la información de los vehículos
  const vehicles = datosDelVehicle()
  // Se calcula la distancia total recorrida por cada tipo de vehículo
  const distances = vehicles.reduce((acc, vehicle) => {
    // Si no se ha encontrado un vehículo de ese tipo, se inicializa el contador
    if (!acc[vehicle.type]) {
      // Se inicializa el contador con la distancia total y la cantidad de vehículos
      acc[vehicle.type] = { totalDistance: 0, count: 0 }
    }

    // Sumo la distancia recorrida por el vehicle
    acc[vehicle.type].totalDistance += vehicle.distance
    // Sumo el vehicle al contador de vehiculos para despues calcular el promedio
    acc[vehicle.type].count++

    // Retorno el acumulador (ACC)
    return acc
  }, {})

  // Calculo el promedio de distancia recorrida por cada tipo de vehículo
  const promedio = {}
  for (const type in distances) {
    promedio[type] = distances[type].totalDistance / distances[type].count
  }

  res.json(promedio)
})

//! Endpoint para el vehiculo con mayor consumo
router.get('/mayorConsumidor', (req, res) => {
  const vehicles = datosDelVehicle().filter(
    (vehicle) => vehicle.fuelConsumption !== undefined,
  )

  // Si no hay vehículos que consuman combustible, se envía un mensaje de error
  if (vehicles.length === 0)
    return res
      .status(404)
      .json({ message: 'No se encontraron vehiculos que consuman combustible' })

  // Se calcula el vehículo con mayor consumo
  const vehiclesMaxConsumidores = vehicles.reduce(
    (max, vehicle) => {
      // Guardo en la constante consumo el consumo del vehiculo
      const consumo = vehicle.distance * vehicle.fuelConsumption

      // Si el consumo calculado es mayor al que tengo guardado, lo reemplazo
      if (consumo > max.consumo) {
        return { vehicles: [vehicle], consumo }

        // Si el consumo calculado es igual al que tengo guardado, lo agrego al array
      } else if (consumo === max.consumo) {
        max.vehicles.push(vehicle)
      }

      // Retorno el acumulador (MAX)
      return max
    },

    // Inicializo el acumulador con un objeto vacío
    { vehicles: [], consumo: 0 },
  )

  // Envio el array de vehiculos con mayor consumo
  res.json(vehiclesMaxConsumidores.vehicles)
})

//! Endpoint para el vehiculo con mayor distancia recorrida
router.get('/mayorDistancia', (req, res, next) => {
  // Se lee la información de los vehículos
  const vehicles = datosDelVehicle()

  // Se calcula el vehículo con mayor distancia recorrida
  const vehicleMaxDistancia = vehicles.reduce(
    (max, vehicle) => {
      // Si la distancia recorrida es mayor a la que tengo guardada, lo reemplazo
      if (vehicle.distance > max.distance) {
        return { vehicles: [vehicle], distance: vehicle.distance }

        // Si la distancia recorrida es igual a la que tengo guardada, lo agrego al array
      } else if (vehicle.distance === max.distance) {
        max.vehicles.push(vehicle)
      }
      return max
    },
    { vehicles: [], distance: 0 },
  )

  // Envio el array de vehiculos con mayor distancia recorrida
  res.json(vehicleMaxDistancia.vehicles)
})

//! Endpoint para la inserción de un nuevo vehículo
router.post('/', (req, res) => {
  const vehicleNuevo = req.body
  // Si le falta algun dato de estos al vehicle, envia un mensaje de error
  if (!vehicleNuevo.id || !vehicleNuevo.type || !vehicleNuevo.distance) {
    return res.status(400).json({ message: 'Faltan informacion en lo campos' })
  }

  // Agrego el nuevo vehicle al array de vehicles
  const vehicles = datosDelVehicle()
  vehicles.push(vehicleNuevo)
  mostrarDatosVehicle(vehicles)

  res.status(201).json(vehicleNuevo)
})

//* EXPORTAR EL ROUTER
module.exports = router