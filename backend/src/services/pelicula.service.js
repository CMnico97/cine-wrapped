// Importamos el pool de conexiones a MySQL.
//
// Este servicio será responsable de realizar
// las consultas relacionadas con películas.
const pool = require("../config/database");

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
    `,
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
    [id],
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
// CREAR PELÍCULA
// =====================================================

// Esta función registra una nueva película
// en nuestra base de datos.
//
// Recibe los datos previamente validados
// por el controlador.
const crearPelicula = async (
  titulo,
  sinopsis,
  duracion,
  genero,
  director,
  poster,
  fechaEstreno,
) => {
  // Ejecutamos la inserción utilizando parámetros (?).
  //
  // Esto evita concatenar directamente información
  // recibida desde el usuario dentro del SQL.
  const [result] = await pool.query(
    `
      INSERT INTO peliculas (
        titulo,
        sinopsis,
        duracion,
        genero,
        director,
        poster,
        fecha_estreno
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [titulo, sinopsis, duracion, genero, director, poster, fechaEstreno],
  );

  // insertId contiene el identificador generado
  // automáticamente por MySQL.
  return result.insertId;
};

// =====================================================
// ACTUALIZAR PELÍCULA
// =====================================================

// Esta función actualiza todos los datos editables
// de una película existente.
//
// El controlador será responsable de validar los datos
// antes de llamar a este servicio.
const actualizarPelicula = async (
  id,
  titulo,
  sinopsis,
  duracion,
  genero,
  director,
  poster,
  fechaEstreno,
) => {
  const [result] = await pool.query(
    `
      UPDATE peliculas
      SET
        titulo = ?,
        sinopsis = ?,
        duracion = ?,
        genero = ?,
        director = ?,
        poster = ?,
        fecha_estreno = ?
      WHERE id = ?
    `,
    [titulo, sinopsis, duracion, genero, director, poster, fechaEstreno, id],
  );

  // affectedRows indica cuántas filas fueron
  // encontradas y procesadas por MySQL.
  return result.affectedRows;
};

// =====================================================
// ELIMINAR PELÍCULA
// =====================================================

// Esta función elimina una película utilizando
// su identificador.
//
// Antes de llegar aquí, el controlador comprobará
// que la película realmente exista.
const eliminarPelicula = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM peliculas
      WHERE id = ?
    `,
    [id],
  );

  // affectedRows nos permite saber cuántas filas
  // fueron eliminadas por MySQL.
  return result.affectedRows;
};

// =====================================================
// EXPORTACIÓN DEL SERVICIO
// =====================================================

module.exports = {
  obtenerPeliculas,
  obtenerPeliculaPorId,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
};
