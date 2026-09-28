// Importamos Express para crear nuestro Router.
const express = require('express');

// Importamos los controladores relacionados
// con las películas.
const {
  listarPeliculas,
  obtenerDetallePelicula
} = require('../controllers/pelicula.controller');

// Importamos el controlador encargado de obtener
// las funciones correspondientes a una película.
const {
  listarFuncionesPorPelicula
} = require('../controllers/funcion.controller');

// =====================================================
// CREACIÓN DEL ROUTER
// =====================================================

// Creamos un router específico para las rutas
// relacionadas con películas.
const router = express.Router();


// =====================================================
// LISTAR PELÍCULAS
// =====================================================

// Esta ruta devuelve todas las películas.
//
// Como este router está montado en:
//
// app.use('/peliculas', peliculaRoutes);
//
// la ruta final será:
//
// GET /peliculas
router.get('/', listarPeliculas);


// =====================================================
// OBTENER DETALLE DE UNA PELÍCULA
// =====================================================

// Esta ruta recibe el identificador de una película
// mediante un parámetro en la URL.
//
// Por ejemplo:
//
// GET /peliculas/1
//
// En ese caso:
//
// req.params.id = "1"
router.get('/:id', obtenerDetallePelicula);

// =====================================================
// LISTAR FUNCIONES DE UNA PELÍCULA
// =====================================================

// Esta ruta devuelve todas las funciones
// correspondientes a una película.
//
// Por ejemplo:
//
// GET /peliculas/1/funciones
router.get(
  '/:id/funciones',
  listarFuncionesPorPelicula
);

// =====================================================
// EXPORTACIÓN DEL ROUTER
// =====================================================

// Exportamos el router para utilizarlo desde app.js.
module.exports = router;