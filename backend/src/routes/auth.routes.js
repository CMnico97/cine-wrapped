// Importamos Express para poder crear un Router.
const express = require('express');

// Importamos los controladores relacionados
// con la autenticación de usuarios.
const {
  register,
  login
} = require('../controllers/auth.controller');

// Importamos el middleware encargado de comprobar
// que el usuario tenga un JWT válido.
const {
  verificarToken
} = require('../middleware/auth.middleware');


// =====================================================
// CREACIÓN DEL ROUTER
// =====================================================

// Creamos un router específico para las rutas
// relacionadas con autenticación.
const router = express.Router();


// =====================================================
// REGISTRO DE USUARIOS
// =====================================================

// Esta ruta ejecutará el controlador register.
//
// Como este router se monta en app.js mediante:
//
// app.use('/auth', authRoutes);
//
// la ruta final será:
//
// POST /auth/register
router.post('/register', register);


// =====================================================
// INICIO DE SESIÓN
// =====================================================

// Esta ruta ejecutará el controlador login.
//
// La ruta final será:
//
// POST /auth/login
router.post('/login', login);


// =====================================================
// RUTA PROTEGIDA DE PRUEBA
// =====================================================

// Esta ruta solamente podrá utilizarse si la petición
// contiene un token JWT válido.
//
// Antes de ejecutar el controlador de la ruta,
// Express ejecutará verificarToken.
router.get('/me', verificarToken, (req, res) => {
  // req.usuario fue creado dentro del middleware
  // después de verificar correctamente el JWT.
  res.status(200).json({
    ok: true,
    message: 'Token válido',
    usuario: req.usuario
  });
});


// =====================================================
// EXPORTACIÓN DEL ROUTER
// =====================================================

// Exportamos el router para utilizarlo desde app.js.
module.exports = router;