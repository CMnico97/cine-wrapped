// Importamos Express para crear el Router.
const express = require('express');

// Importamos el controlador encargado
// de obtener el historial de entradas.
const {
  listarEntradasUsuario
} = require('../controllers/entrada.controller');

// Importamos el middleware de autenticación.
//
// Esta ruta contiene información privada del usuario,
// por lo que solamente podrá acceder alguien
// que tenga un JWT válido.
const {
  verificarToken
} = require('../middleware/auth.middleware');


// =====================================================
// CREACIÓN DEL ROUTER
// =====================================================

const router = express.Router();


// =====================================================
// HISTORIAL DE ENTRADAS DEL USUARIO
// =====================================================

// Ruta:
//
// GET /usuarios/me/entradas
//
// Primero ejecutamos verificarToken.
//
// Si el JWT es válido, verificarToken guardará:
//
// req.usuario.id
// req.usuario.rol
//
// Después se ejecutará listarEntradasUsuario.
router.get(
  '/me/entradas',
  verificarToken,
  listarEntradasUsuario
);


// =====================================================
// EXPORTACIÓN DEL ROUTER
// =====================================================

module.exports = router;