function mostrarImagen() {
  let input = document.querySelector('#imagenInput').value
  let imagen = document.getElementById(input)

  if (imagen !== null) {
    imagen.classList.remove('hidden')
    imagen.style.width = '100px'
    imagen.style.height = 'auto'
  } else {
    // Si la imagen no existe, mostrar un mensaje de error en la consola
    console.error('Ingreso mal los datos')
  }
}
