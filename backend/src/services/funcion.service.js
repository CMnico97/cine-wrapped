// Importamos el pool de conexiones a MySQL.
//
// Este servicio será responsable de realizar
// las consultas relacionadas con las funciones
// disponibles en el cine.
const pool = require("../config/database");

// =====================================================
// OBTENER FUNCIONES POR PELÍCULA
// =====================================================

// Esta función obtiene todas las funciones asociadas
// a una película específica.
//
// Recibe como parámetro el identificador de la película.
const obtenerFuncionesPorPelicula = async (peliculaId) => {
  // Consultamos la tabla funciones buscando aquellas
  // que pertenezcan a la película indicada.
  //
  // Ordenamos primero por fecha y luego por hora
  // para mostrar las funciones cronológicamente.
  const [rows] = await pool.query(
    `
      SELECT
        id,
        pelicula_id,
        fecha,
        hora,
        sala
      FROM funciones
      WHERE pelicula_id = ?
      ORDER BY fecha ASC, hora ASC
    `,
    [peliculaId],
  );

  // Devolvemos todas las funciones encontradas.
  //
  // Si la película no tiene funciones,
  // simplemente devolveremos un arreglo vacío.
  return rows;
};

// =====================================================
// OBTENER FUNCIÓN POR ID
// =====================================================

// Esta función busca una función específica
// utilizando su identificador.
//
// La utilizaremos antes de consultar los asientos
// para comprobar que la función realmente exista.
const obtenerFuncionPorId = async (id) => {
  // Buscamos la función correspondiente al id recibido.
  const [rows] = await pool.query(
    `
      SELECT
        id,
        pelicula_id,
        fecha,
        hora,
        sala
      FROM funciones
      WHERE id = ?
    `,
    [id],
  );

  // Como id es una clave primaria, solamente puede
  // existir una función con ese identificador.
  //
  // Si no existe, rows[0] será undefined.
  return rows[0];
};

// =====================================================
// OBTENER ASIENTOS DE UNA FUNCIÓN
// =====================================================

// Esta función obtiene todos los asientos correspondientes
// a la sala donde se realizará una función.
//
// Además calcula si cada asiento se encuentra
// disponible u ocupado para ESA función.
const obtenerAsientosPorFuncion = async (funcionId, sala) => {
  // Obtenemos los asientos de la sala correspondiente.
  //
  // LEFT JOIN nos permite conservar también los asientos
  // que todavía no están asociados a ninguna entrada.
  //
  // Si entrada_asientos contiene una coincidencia para
  // la función y el asiento, significa que ese asiento
  // ya está ocupado.
  const [rows] = await pool.query(
    `
      SELECT
        a.id,
        a.fila,
        a.numero,
        a.sala,
        CASE
          WHEN ea.id IS NULL THEN TRUE
          ELSE FALSE
        END AS disponible
      FROM asientos AS a
      LEFT JOIN entrada_asientos AS ea
        ON ea.asiento_id = a.id
        AND ea.funcion_id = ?
      WHERE a.sala = ?
      ORDER BY a.fila ASC, a.numero ASC
    `,
    [funcionId, sala],
  );

  // Devolvemos todos los asientos con
  // su estado de disponibilidad.
  return rows;
};

// =====================================================
// CREAR FUNCIÓN
// =====================================================

// Esta función registra una nueva función
// cinematográfica en la base de datos.
//
// Recibe:
//
// - peliculaId: película que será proyectada.
// - fecha: día de la función.
// - hora: horario de la función.
// - sala: número de sala.
//
// El controlador será responsable de validar
// estos datos antes de llamar al servicio.
const crearFuncion = async (peliculaId, fecha, hora, sala) => {
  const [result] = await pool.query(
    `
      INSERT INTO funciones (
        pelicula_id,
        fecha,
        hora,
        sala
      )
      VALUES (?, ?, ?, ?)
    `,
    [peliculaId, fecha, hora, sala],
  );

  // MySQL genera automáticamente el identificador
  // de la nueva función.
  return result.insertId;
};

// =====================================================
// ACTUALIZAR FUNCIÓN
// =====================================================

// Esta función actualiza los datos de una función
// existente en la base de datos.
//
// Recibe:
//
// - id: identificador de la función.
// - peliculaId: película asociada.
// - fecha: fecha de la función.
// - hora: horario de la función.
// - sala: número de sala.
const actualizarFuncion = async (id, peliculaId, fecha, hora, sala) => {
  const [result] = await pool.query(
    `
      UPDATE funciones
      SET
        pelicula_id = ?,
        fecha = ?,
        hora = ?,
        sala = ?
      WHERE id = ?
    `,
    [peliculaId, fecha, hora, sala, id],
  );

  // Devolvemos la cantidad de filas afectadas
  // por la operación.
  return result.affectedRows;
};

// =====================================================
// ELIMINAR FUNCIÓN
// =====================================================

// Esta función elimina una función existente
// utilizando su identificador.
//
// El controlador comprobará previamente
// que la función exista.
const eliminarFuncion = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM funciones
      WHERE id = ?
    `,
    [id],
  );

  // Devolvemos la cantidad de filas eliminadas.
  return result.affectedRows;
};

// =====================================================
// EXPORTACIÓN DEL SERVICIO
// =====================================================

module.exports = {
  obtenerFuncionesPorPelicula,
  obtenerFuncionPorId,
  obtenerAsientosPorFuncion,
  crearFuncion,
  actualizarFuncion,
  eliminarFuncion,
};
