const express = require('express')
const bodyParser = require('body-parser')
const vehicleRoutes = require('./routes/vehicles')

const app = express()
const PORT = process.env.PORT || 3000

// Dando permiso a la app para que pueda recibir datos en formato JSON
app.use(bodyParser.json())

// Rutas
app.use('/api/vehicles', vehicleRoutes)

app.listen(PORT, () => {
  console.log(`El servidor esta corriendo en el puerto ${PORT}`)
})
