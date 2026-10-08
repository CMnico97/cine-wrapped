// Importamos Express para poder crear un Router.
const express = require("express");

// Importamos los controladores relacionados
// con la autenticación de usuarios.
const {
  register,
  login,
  obtenerPerfil,
} = require("../controllers/auth.controller");

// Importamos el middleware encargado de comprobar
// que el usuario tenga un JWT válido.
const { verificarToken } = require("../middleware/auth.middleware");

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
router.post("/register", register);

// =====================================================
// INICIO DE SESIÓN
// =====================================================

// Esta ruta ejecutará el controlador login.
//
// La ruta final será:
//
// POST /auth/login
router.post("/login", login);

// =====================================================
// PERFIL DEL USUARIO AUTENTICADO
// =====================================================

// Esta ruta devuelve la información del usuario
// que actualmente tiene una sesión válida.
//
// Primero ejecutamos verificarToken.
//
// Si el JWT es válido, el middleware guarda
// la información del token dentro de req.usuario.
//
// Después ejecutamos obtenerPerfil, que utiliza
// el id del usuario para consultar sus datos
// actualizados directamente desde MySQL.
//
// La ruta final será:
//
// GET /auth/me
router.get("/me", verificarToken, obtenerPerfil);

// =====================================================
// EXPORTACIÓN DEL ROUTER
// =====================================================

// Exportamos el router para utilizarlo desde app.js.
module.exports = router;
