// Importamos Express para crear nuestro Router.
const express = require("express");

// Importamos el controlador encargado de obtener
// los asientos correspondientes a una función.
const {
  listarAsientosPorFuncion,
} = require("../controllers/funcion.controller");

// =====================================================
// CREACIÓN DEL ROUTER
// =====================================================

// Creamos un router específico para las rutas
// relacionadas con funciones.
const router = express.Router();

// =====================================================
// LISTAR ASIENTOS DE UNA FUNCIÓN
// =====================================================

// Esta ruta permite consultar los asientos
// correspondientes a una función.
//
// Como este router posteriormente será montado en:
//
// app.use('/funciones', funcionRoutes);
//
// la ruta final será:
//
// GET /funciones/:id/asientos
router.get("/:id/asientos", listarAsientosPorFuncion);

// =====================================================
// EXPORTACIÓN DEL ROUTER
// =====================================================

// Exportamos el router para utilizarlo desde app.js.
module.exports = router;
