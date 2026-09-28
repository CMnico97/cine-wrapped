// Importamos mysql2 utilizando su versión basada en promesas.
// Esto permite utilizar async/await cuando hagamos consultas a MySQL.
const mysql = require('mysql2/promise');

// Cargamos las variables de entorno definidas en el archivo .env.
require('dotenv').config();

// Creamos un pool de conexiones.
//
// Un pool mantiene varias conexiones disponibles con MySQL,
// permitiendo reutilizarlas en lugar de abrir una conexión nueva
// para cada petición que reciba nuestra API.
const pool = mysql.createPool({
  // Dirección donde se encuentra el servidor MySQL.
  host: process.env.DB_HOST,

  // Puerto utilizado por MySQL.
  port: process.env.DB_PORT,

  // Usuario con el que nos conectaremos.
  user: process.env.DB_USER,

  // Contraseña del usuario de MySQL.
  password: process.env.DB_PASSWORD,

  // Base de datos utilizada por la aplicación.
  database: process.env.DB_NAME,

  // Espera una conexión libre si todas están siendo utilizadas.
  waitForConnections: true,

  // Cantidad máxima de conexiones simultáneas en el pool.
  connectionLimit: 10,

  // 0 significa que no establecemos un límite de consultas
  // esperando por una conexión disponible.
  queueLimit: 0
});

// Exportamos el pool para poder utilizarlo posteriormente
// en controladores, servicios y otras partes del backend.
module.exports = pool;