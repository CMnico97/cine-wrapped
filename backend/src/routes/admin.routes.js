// Importamos Express para crear las rutas
// correspondientes al panel administrativo.
const express = require('express');

// Importamos nuestros dos middlewares.
//
// verificarToken:
// comprueba que exista un JWT válido.
//
// verificarAdmin:
// comprueba que el usuario tenga rol "admin".
const {
  verificarToken,
  verificarAdmin
} = require('../middleware/auth.middleware');

// Importamos los controladores correspondientes
// a las operaciones administrativas.
const {
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula
} = require('../controllers/admin.controller');


// =====================================================
// CREACIÓN DEL ROUTER
// =====================================================

const router = express.Router();


// =====================================================
// PROTEGER TODAS LAS RUTAS ADMINISTRATIVAS
// =====================================================

// Estos middlewares se ejecutarán para TODAS
// las rutas declaradas debajo.
//
// El orden es importante:
//
// 1. verificarToken
// 2. verificarAdmin
//
// Primero autenticamos al usuario y después
// comprobamos sus permisos.
router.use(
  verificarToken,
  verificarAdmin
);

// =====================================================
// ADMINISTRACIÓN DE PELÍCULAS
// =====================================================

// Permite crear una nueva película.
//
// Como anteriormente utilizamos:
//
// router.use(verificarToken, verificarAdmin)
//
// esta ruta ya se encuentra protegida.
router.post(
  '/peliculas',
  crearPelicula
);

// Permite modificar una película existente.
//
// :id representa el identificador de la película.
//
// Ejemplo:
//
// PUT /admin/peliculas/2
router.put(
  '/peliculas/:id',
  actualizarPelicula
);

// Permite eliminar una película existente.
//
// Ejemplo:
//
// DELETE /admin/peliculas/2
router.delete(
  '/peliculas/:id',
  eliminarPelicula
);

// =====================================================
// RUTA TEMPORAL DE PRUEBA
// =====================================================

// Esta ruta existe solamente para comprobar
// que la protección administrativa funciona.
//
// Más adelante podremos eliminarla.
router.get('/test', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Acceso de administrador autorizado',
    usuario: req.usuario
  });
});


// =====================================================
// EXPORTACIÓN DEL ROUTER
// =====================================================

module.exports = router;