// Importamos Express para poder crear un Router.
const express = require('express');

// Importamos los controladores relacionados
// con la autenticación de usuarios.
const {
  register,
  login
} = require('../controllers/auth.controller');


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
// EXPORTACIÓN DEL ROUTER
// =====================================================

// Exportamos el router para utilizarlo desde app.js.
module.exports = router;