// Importamos Router desde Express.
const { Router } = require("express");

// Importamos el controlador de productos.
const { listarProductos } = require("../controllers/producto.controller");

// Creamos el enrutador.
const router = Router();

// =====================================================
// GET /productos
// =====================================================

// Esta ruta será pública.
// No es necesario iniciar sesión para consultar
// el catálogo de popcorn y bebidas.
router.get("/", listarProductos);

// =====================================================
// EXPORTACIÓN DE RUTAS
// =====================================================

module.exports = router;
