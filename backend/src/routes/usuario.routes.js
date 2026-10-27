
const express = require("express");

// =====================================================
// IMPORTAR CONTROLADORES
// =====================================================

// Controlador del historial de entradas.
const {
  listarEntradasUsuario,
} = require("../controllers/entrada.controller");

// Middleware encargado de validar el JWT.
const {
  verificarToken,
} = require("../middleware/auth.middleware");

// Controlador de estadísticas Cine Wrapped.
const {
  obtenerWrapped,
} = require("../controllers/wrapped.controller");

// Controladores del sistema de puntos.
//
// consultarMisPuntos obtiene el saldo actual.
// consultarMovimientosPuntos obtiene el historial.
const {
  consultarMisPuntos,
  consultarMovimientosPuntos,
} = require("../controllers/puntos.controller");

// =====================================================
// CREACIÓN DEL ROUTER
// =====================================================

const router = express.Router();

// =====================================================
// HISTORIAL DE ENTRADAS
// =====================================================

// GET /usuarios/me/entradas
//
// Solo devuelve las entradas del usuario autenticado.
router.get(
  "/me/entradas",
  verificarToken,
  listarEntradasUsuario
);

// =====================================================
// ESTADÍSTICAS CINE WRAPPED
// =====================================================

// GET /usuarios/me/wrapped
//
// Devuelve las estadísticas personales del usuario.
router.get(
  "/me/wrapped",
  verificarToken,
  obtenerWrapped
);

// =====================================================
// CONSULTAR SALDO DE PUNTOS
// =====================================================

// GET /usuarios/me/puntos
//
// Consulta la billetera del usuario autenticado.
router.get(
  "/me/puntos",
  verificarToken,
  consultarMisPuntos
);

// =====================================================
// HISTORIAL DE MOVIMIENTOS DE PUNTOS
// =====================================================

// GET /usuarios/me/puntos/movimientos
//
// Devuelve los movimientos de acumulación y canje
// realizados en entradas y confitería.
//
// El usuario se identifica mediante el JWT,
// evitando consultar movimientos de otras personas.
router.get(
  "/me/puntos/movimientos",
  verificarToken,
  consultarMovimientosPuntos
);

// =====================================================
// EXPORTACIÓN DEL ROUTER
// =====================================================

module.exports = router;
