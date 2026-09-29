// Importamos Express para crear nuestro Router.
const express = require('express');

// Importamos el controlador encargado
// del proceso de creación de entradas.
const {
  crearEntrada
} = require('../controllers/entrada.controller');

// Importamos el middleware de autenticación.
//
// Solamente un usuario autenticado podrá
// realizar una compra.
const {
  verificarToken
} = require('../middleware/auth.middleware');


// =====================================================
// CREACIÓN DEL ROUTER
// =====================================================

const router = express.Router();


// =====================================================
// CREAR ENTRADA
// =====================================================

// Esta ruta manejará la compra simulada.
//
// verificarToken se ejecuta antes que crearEntrada.
//
// Por lo tanto:
//
// 1. Primero comprobamos el JWT.
// 2. Después procesamos la compra.
//
// Ruta final:
//
// POST /entradas
router.post(
  '/',
  verificarToken,
  crearEntrada
);


// =====================================================
// EXPORTACIÓN DEL ROUTER
// =====================================================

module.exports = router;