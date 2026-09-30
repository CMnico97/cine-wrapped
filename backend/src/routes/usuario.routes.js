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

// Importamos el controlador encargado
// de generar las estadísticas de Cine Wrapped.
const {
  obtenerWrapped
} = require('../controllers/wrapped.controller');

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
// CINE WRAPPED DEL USUARIO
// =====================================================

// Ruta:
//
// GET /usuarios/me/wrapped
//
// Esta ruta también está protegida mediante JWT.
//
// El usuario no envía su identificador.
// verificarToken obtiene el usuario directamente
// desde el token de autenticación.
router.get(
  '/me/wrapped',
  verificarToken,
  obtenerWrapped
);

// =====================================================
// EXPORTACIÓN DEL ROUTER
// =====================================================

module.exports = router;