// Importamos el pool de conexiones a MySQL.
//
// Cine Wrapped no tendrá una tabla propia.
// Todas las estadísticas se calcularán utilizando
// las entradas confirmadas que ya existen en la BD.
const pool = require("../config/database");

// =====================================================
// OBTENER RESUMEN GENERAL
// =====================================================

// Esta consulta calcula:
//
// 1. Cantidad de películas vistas.
// 2. Minutos acumulados en cine.
//
// Consideramos cada entrada confirmada como
// una película vista.
const obtenerResumenGeneral = async (usuarioId) => {
  const [rows] = await pool.query(
    `
      SELECT
        COUNT(e.id) AS peliculas_vistas,

        COALESCE(
          SUM(p.duracion),
          0
        ) AS minutos_en_cine

      FROM entradas AS e

      INNER JOIN funciones AS f
        ON f.id = e.funcion_id

      INNER JOIN peliculas AS p
        ON p.id = f.pelicula_id

      WHERE e.usuario_id = ?
        AND e.estado = 'confirmada'
    `,
    [usuarioId],
  );

  // Las funciones de agregación devuelven
  // una sola fila.
  return rows[0];
};

// =====================================================
// OBTENER GÉNERO MÁS VISTO
// =====================================================

// Agrupamos las entradas confirmadas según
// el género de la película.
//
// Después ordenamos de mayor a menor cantidad
// y obtenemos solamente el primer resultado.
const obtenerGeneroMasVisto = async (usuarioId) => {
  const [rows] = await pool.query(
    `
      SELECT
        p.genero,
        COUNT(e.id) AS cantidad

      FROM entradas AS e

      INNER JOIN funciones AS f
        ON f.id = e.funcion_id

      INNER JOIN peliculas AS p
        ON p.id = f.pelicula_id

      WHERE e.usuario_id = ?
        AND e.estado = 'confirmada'

      GROUP BY p.genero

      ORDER BY
        cantidad DESC,
        p.genero ASC

      LIMIT 1
    `,
    [usuarioId],
  );

  // Si el usuario todavía no tiene entradas,
  // esta consulta no devolverá resultados.
  return rows[0] || null;
};

// =====================================================
// OBTENER MES MÁS ACTIVO
// =====================================================

// Para esta estadística utilizamos la fecha de
// la función y no la fecha en que se realizó la compra.
//
// Esto representa mejor el mes en que el usuario
// fue al cine.
const obtenerMesMasActivo = async (usuarioId) => {
  const [rows] = await pool.query(
    `
      SELECT
        YEAR(f.fecha) AS anio,
        MONTH(f.fecha) AS mes,
        COUNT(e.id) AS cantidad

      FROM entradas AS e

      INNER JOIN funciones AS f
        ON f.id = e.funcion_id

      WHERE e.usuario_id = ?
        AND e.estado = 'confirmada'

      GROUP BY
        YEAR(f.fecha),
        MONTH(f.fecha)

      ORDER BY
        cantidad DESC,
        anio DESC,
        mes DESC

      LIMIT 1
    `,
    [usuarioId],
  );

  return rows[0] || null;
};

// =====================================================
// OBTENER ÚLTIMA PELÍCULA
// =====================================================

// Buscamos la función más reciente correspondiente
// a una entrada confirmada del usuario.
//
// Ordenamos por fecha y hora de la función,
// no por la fecha en que compró la entrada.
const obtenerUltimaPelicula = async (usuarioId) => {
  const [rows] = await pool.query(
    `
      SELECT
        p.id,
        p.titulo,
        p.poster,
        f.fecha,
        f.hora

      FROM entradas AS e

      INNER JOIN funciones AS f
        ON f.id = e.funcion_id

      INNER JOIN peliculas AS p
        ON p.id = f.pelicula_id

      WHERE e.usuario_id = ?
        AND e.estado = 'confirmada'

      ORDER BY
        f.fecha DESC,
        f.hora DESC

      LIMIT 1
    `,
    [usuarioId],
  );

  return rows[0] || null;
};

// =====================================================
// EXPORTACIÓN DEL SERVICIO
// =====================================================

module.exports = {
  obtenerResumenGeneral,
  obtenerGeneroMasVisto,
  obtenerMesMasActivo,
  obtenerUltimaPelicula,
};
