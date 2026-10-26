// Importamos Express Router.
const { Router } = require("express");

// Middleware de autenticación y permisos.
const {
  verificarToken,
  verificarAdmin,
} = require("../middleware/auth.middleware");

// Importamos los controladores.
const {
  obtenerProductosAdmin,
  agregarProductoAdmin,
  actualizarProductoAdmin,
  actualizarDisponibilidadAdmin,
} = require("../controllers/adminProducto.controller");

const router = Router();

// Todas las rutas requieren una sesión válida
// y que el usuario tenga el rol de administrador.
router.use(verificarToken, verificarAdmin);

// Consultar todos los productos.
router.get("/", obtenerProductosAdmin);

// Agregar un producto.
router.post("/", agregarProductoAdmin);

// Editar un producto.
router.put("/:id", actualizarProductoAdmin);

// Activar o desactivar un producto.
router.patch("/:id/disponibilidad", actualizarDisponibilidadAdmin);

// Exportamos las rutas.
module.exports = router;
