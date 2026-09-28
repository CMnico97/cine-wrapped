// Cargamos las variables de entorno definidas
// en el archivo .env.
//
// Lo hacemos antes de iniciar nuestra aplicación.
require('dotenv').config();

// Importamos la aplicación Express que configuramos
// dentro de src/app.js.
const app = require('./src/app');


// =====================================================
// CONFIGURACIÓN DEL SERVIDOR
// =====================================================

// Obtenemos el puerto desde nuestro archivo .env.
//
// Si por algún motivo PORT no está definido,
// utilizaremos el puerto 3000.
const PORT = process.env.PORT || 3000;


// =====================================================
// INICIO DEL SERVIDOR
// =====================================================

// Iniciamos el servidor HTTP.
//
// A partir de este momento Express comenzará
// a escuchar peticiones en el puerto indicado.
app.listen(PORT, () => {
  console.log(
    `Servidor funcionando en http://localhost:${PORT}`
  );
});