// Importamos Express para crear nuestro Router.
const express = require('express');

// Importamos los controladores relacionados
// con las películas.
const {
  listarPeliculas,
  obtenerDetallePelicula
} = require('../controllers/pelicula.controller');


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
// EXPORTACIÓN DEL ROUTER
// =====================================================

// Exportamos el router para utilizarlo desde app.js.
module.exports = router;