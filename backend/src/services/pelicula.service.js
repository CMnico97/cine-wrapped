// Importamos el pool de conexiones a MySQL.
//
// Este servicio será responsable de realizar
// las consultas relacionadas con películas.
const pool = require('../config/database');


// =====================================================
// OBTENER TODAS LAS PELÍCULAS
// =====================================================

// Esta función obtiene todas las películas
// almacenadas en la tabla peliculas.
const obtenerPeliculas = async () => {
  // Ejecutamos una consulta SQL para obtener
  // la información necesaria para la cartelera.
  //
  // Ordenamos las películas por título para mantener
  // una respuesta consistente.
  const [rows] = await pool.query(
    `
      SELECT
        id,
        titulo,
        sinopsis,
        duracion,
        genero,
        director,
        poster,
        fecha_estreno
      FROM peliculas
      ORDER BY titulo ASC
    `
  );

  // Devolvemos el arreglo de películas obtenido
  // desde MySQL.
  return rows;
};

// =====================================================
// OBTENER PELÍCULA POR ID
// =====================================================

// Esta función busca una película específica
// utilizando su identificador único.
const obtenerPeliculaPorId = async (id) => {
  // Utilizamos un parámetro (?) en lugar de insertar
  // directamente el id dentro de la consulta.
  //
  // Esto permite que mysql2 maneje el valor de forma
  // segura y ayuda a prevenir inyecciones SQL.
  const [rows] = await pool.query(
    `
      SELECT
        id,
        titulo,
        sinopsis,
        duracion,
        genero,
        director,
        poster,
        fecha_estreno
      FROM peliculas
      WHERE id = ?
    `,
    [id]
  );

  // Como el id es una clave primaria, solamente puede
  // existir una película con ese identificador.
  //
  // Por eso devolvemos el primer resultado.
  //
  // Si no existe ninguna película con ese id,
  // rows[0] será undefined.
  return rows[0];
};

// =====================================================
// EXPORTACIÓN DEL SERVICIO
// =====================================================

// Exportamos las funciones para poder utilizarlas
// desde pelicula.controller.js.
module.exports = {
  obtenerPeliculas,
  obtenerPeliculaPorId
};