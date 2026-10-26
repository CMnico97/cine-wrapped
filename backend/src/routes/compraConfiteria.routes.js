// Importamos Express Router.
const { Router } = require("express");

// Middleware que valida el JWT.
const { verificarToken } = require("../middleware/auth.middleware");

// Controladores de compras de confitería.
const {
  confirmarCompraConfiteria,
  consultarHistorialConfiteria,
} = require("../controllers/compraConfiteria.controller");

// Creamos el enrutador.
const router = Router();

// =====================================================
// REGISTRAR COMPRA SIMULADA
// POST /compras-confiteria
// =====================================================

router.post("/", verificarToken, confirmarCompraConfiteria);

// =====================================================
// CONSULTAR MIS COMPRAS DE CONFITERÍA
// GET /compras-confiteria/mis-compras
// =====================================================

router.get("/mis-compras", verificarToken, consultarHistorialConfiteria);

// Exportamos las rutas.
module.exports = router;
