
const pool = require("../config/database");

// =====================================================
// OBTENER FUNCIONES POR PELÍCULA
// =====================================================

// Obtiene las funciones de una película.
// Incluye el precio de cada entrada para que
// el usuario pueda verlo antes de comprar.
const obtenerFuncionesPorPelicula = async (peliculaId) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        pelicula_id,
        fecha,
        hora,
        sala,
        precio_entrada
      FROM funciones
      WHERE pelicula_id = ?
      ORDER BY fecha ASC, hora ASC
    `,
    [peliculaId],
  );

  return rows;
};

// =====================================================
// OBTENER FUNCIÓN POR ID
// =====================================================

// Busca una función por su identificador.
// También devuelve el precio registrado en MySQL.
const obtenerFuncionPorId = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        pelicula_id,
        fecha,
        hora,
        sala,
        precio_entrada
      FROM funciones
      WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

// =====================================================
// OBTENER ASIENTOS DE UNA FUNCIÓN
// =====================================================

// Consulta los asientos de la sala y determina
// cuáles están disponibles para esa función.
const obtenerAsientosPorFuncion = async (funcionId, sala) => {
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

  return rows;
};

// =====================================================
// CREAR FUNCIÓN
// =====================================================

// Registra una nueva función con su precio.
//
// Parámetros:
// peliculaId    → película que se proyectará.
// fecha         → fecha de la función.
// hora          → horario de la función.
// sala          → sala de exhibición.
// precioEntrada → precio de cada asiento en CLP.
const crearFuncion = async (
  peliculaId,
  fecha,
  hora,
  sala,
  precioEntrada
) => {
  // Validamos que el precio sea un entero positivo.
  const precio = Number(precioEntrada);

  if (!Number.isSafeInteger(precio) || precio <= 0) {
    const error = new Error(
      "El precio de la entrada debe ser mayor que cero"
    );
    error.code = "PRECIO_INVALIDO";
    throw error;
  }

  // Guardamos la función y su precio.
  const [result] = await pool.query(
    `
      INSERT INTO funciones (
        pelicula_id,
        fecha,
        hora,
        sala,
        precio_entrada
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [peliculaId, fecha, hora, sala, precio],
  );

  return result.insertId;
};

// =====================================================
// ACTUALIZAR FUNCIÓN
// =====================================================

// Permite modificar los datos de una función,
// incluido el precio de la entrada.
const actualizarFuncion = async (
  id,
  peliculaId,
  fecha,
  hora,
  sala,
  precioEntrada
) => {
  const precio = Number(precioEntrada);

  // Evitamos guardar precios inválidos.
  if (!Number.isSafeInteger(precio) || precio <= 0) {
    const error = new Error(
      "El precio de la entrada debe ser mayor que cero"
    );
    error.code = "PRECIO_INVALIDO";
    throw error;
  }

  const [result] = await pool.query(
    `
      UPDATE funciones
      SET
        pelicula_id = ?,
        fecha = ?,
        hora = ?,
        sala = ?,
        precio_entrada = ?
      WHERE id = ?
    `,
    [
      peliculaId,
      fecha,
      hora,
      sala,
      precio,
      id,
    ],
  );

  return result.affectedRows;
};

// =====================================================
// ELIMINAR FUNCIÓN
// =====================================================

// Elimina una función según su identificador.
// Las restricciones de integridad existentes
// deben seguir aplicándose.
const eliminarFuncion = async (id) => {
  const [result] = await pool.query(
    `
      DELETE FROM funciones
      WHERE id = ?
    `,
    [id],
  );

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
