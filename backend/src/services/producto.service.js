// Importamos el pool de conexiones a MySQL.
// Utilizamos el mismo formato CommonJS
// que ya tiene nuestro proyecto.
const pool = require("../config/database");

// =====================================================
// OBTENER PRODUCTOS DISPONIBLES
// =====================================================

// Esta función consulta los productos de confitería
// que se encuentran habilitados para su venta.
const obtenerProductosDisponibles = async () => {
  // Ejecutamos la consulta utilizando el pool.
  const [productos] = await pool.query(`
    SELECT
      id,
      nombre,
      descripcion,
      categoria,
      precio,
      imagen,
      disponible
    FROM productos
    WHERE disponible = 1
    ORDER BY categoria, nombre
  `);

  // Devolvemos los productos encontrados.
  return productos;
};

// =====================================================
// EXPORTACIÓN DEL SERVICIO
// =====================================================

module.exports = {
  obtenerProductosDisponibles,
};
