// Importamos Express para crear y configurar nuestra aplicación.
const express = require('express');

// Importamos CORS para permitir que nuestro frontend
// pueda realizar peticiones HTTP al backend.
const cors = require('cors');

// Importamos el pool de conexiones a MySQL.
//
// Lo utilizaremos temporalmente en la ruta de prueba
// para comprobar que la conexión con cine_db sigue funcionando.
const pool = require('./config/database');

// Importamos las rutas relacionadas con autenticación.
//
// Aquí tendremos registro, login y posteriormente
// otras operaciones relacionadas con la sesión.
const authRoutes = require('./routes/auth.routes');


// =====================================================
// CREACIÓN DE LA APLICACIÓN
// =====================================================

// Creamos la aplicación de Express.
const app = express();


// =====================================================
// MIDDLEWARES GENERALES
// =====================================================

// Habilitamos CORS.
//
// Nuestro frontend y backend se ejecutan en puertos diferentes:
//
// Frontend: localhost:5173
// Backend:  localhost:3000
//
// CORS permitirá la comunicación entre ambos.
app.use(cors());


// Permitimos que Express pueda interpretar cuerpos
// de peticiones enviados en formato JSON.
//
// Por ejemplo:
//
// {
//   "nombre": "Nico",
//   "email": "nico@correo.cl",
//   "password": "123456"
// }
app.use(express.json());


// =====================================================
// RUTAS DE LA API
// =====================================================

// Todas las rutas definidas dentro de auth.routes.js
// tendrán como prefijo /auth.
//
// Por ejemplo:
//
// router.post('/register', ...)
//
// se transforma en:
//
// POST /auth/register
app.use('/auth', authRoutes);


// =====================================================
// RUTA DE PRUEBA DE EXPRESS
// =====================================================

// Esta ruta comprueba que la aplicación Express
// está funcionando correctamente.
app.get('/api/health', (req, res) => {
  // Respondemos con código HTTP 200 y un objeto JSON.
  res.status(200).json({
    ok: true,
    message: 'API de Cine Wrapped funcionando'
  });
});


// =====================================================
// RUTA TEMPORAL DE PRUEBA DE MYSQL
// =====================================================

// Esta ruta comprueba que Express puede consultar
// información real desde nuestra base de datos.
app.get('/api/health/database', async (req, res) => {
  try {
    // Consultamos todas las películas almacenadas
    // actualmente en la tabla peliculas.
    const [rows] = await pool.query(
      'SELECT * FROM peliculas'
    );

    // Si la consulta se ejecuta correctamente,
    // enviamos las películas obtenidas como respuesta.
    res.status(200).json({
      ok: true,
      message: 'Conexión con MySQL funcionando correctamente',
      peliculas: rows
    });

  } catch (error) {
    // Si ocurre un error, mostramos información
    // en la terminal del backend.
    console.error(
      'Error al consultar MySQL:',
      error.message
    );

    // Enviamos un error HTTP 500 al cliente.
    res.status(500).json({
      ok: false,
      message: 'No fue posible consultar la base de datos'
    });
  }
});


// =====================================================
// EXPORTACIÓN DE LA APLICACIÓN
// =====================================================

// Exportamos la aplicación Express.
//
// IMPORTANTE:
//
// app.js solamente configura la aplicación.
//
// El encargado de iniciar el servidor mediante
// app.listen() es server.js.
module.exports = app;