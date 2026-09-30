// Importamos el módulo crypto incluido en Node.js.
//
// Lo utilizaremos para generar un identificador
// aleatorio para el código de cada entrada.
const crypto = require('crypto');

// Importamos el pool de conexiones a MySQL.
//
// Además de ejecutar consultas normales,
// utilizaremos este pool para obtener una conexión
// exclusiva durante la transacción.
const pool = require('../config/database');


// =====================================================
// OBTENER ASIENTOS POR IDS
// =====================================================

// Esta función recibe un arreglo con los identificadores
// de los asientos seleccionados por el usuario.
const obtenerAsientosPorIds = async (asientosIds) => {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        sala,
        fila,
        numero
      FROM asientos
      WHERE id IN (?)
    `,
    [asientosIds]
  );

  return rows;
};


// =====================================================
// OBTENER ASIENTOS OCUPADOS
// =====================================================

// Comprueba cuáles de los asientos seleccionados
// ya están asociados a una entrada para la función.
const obtenerAsientosOcupados = async (
  funcionId,
  asientosIds
) => {
  const [rows] = await pool.query(
    `
      SELECT
        asiento_id
      FROM entrada_asientos
      WHERE funcion_id = ?
        AND asiento_id IN (?)
    `,
    [funcionId, asientosIds]
  );

  return rows;
};


// =====================================================
// CREAR ENTRADA CON TRANSACCIÓN
// =====================================================

// Esta función realiza la operación definitiva
// de compra.
//
// Recibe:
//
// usuarioId  → usuario autenticado.
// funcionId  → función seleccionada.
// asientosIds → asientos seleccionados.
const crearEntrada = async (
  usuarioId,
  funcionId,
  asientosIds
) => {
  // Obtenemos una conexión específica del pool.
  //
  // Todas las operaciones de la transacción deben
  // utilizar ESTA MISMA conexión.
  const connection = await pool.getConnection();

  try {
    // =================================================
    // INICIAR TRANSACCIÓN
    // =================================================

    await connection.beginTransaction();


    // =================================================
    // COMPROBAR DISPONIBILIDAD NUEVAMENTE
    // =================================================

    // Volvemos a consultar los asientos ocupados
    // dentro de la transacción.
    //
    // FOR UPDATE bloquea las filas encontradas
    // mientras la transacción se encuentra activa.
    const [asientosOcupados] = await connection.query(
      `
        SELECT
          asiento_id
        FROM entrada_asientos
        WHERE funcion_id = ?
          AND asiento_id IN (?)
        FOR UPDATE
      `,
      [funcionId, asientosIds]
    );

    // Si encontramos algún asiento ocupado,
    // cancelamos la operación.
    if (asientosOcupados.length > 0) {
      const error = new Error(
        'Uno o más asientos seleccionados ya están ocupados'
      );

      // Guardamos un código para que el controlador
      // pueda reconocer este error de negocio.
      error.code = 'ASIENTO_OCUPADO';

      throw error;
    }


    // =================================================
    // GENERAR CÓDIGO DE ENTRADA
    // =================================================

    // randomUUID genera un identificador prácticamente
    // único sin necesitar instalar otra dependencia.
    //
    // Ejemplo:
    //
    // CINE-550e8400-e29b-41d4-a716-446655440000
    const codigo = `CINE-${crypto.randomUUID()}`;


    // =================================================
    // CREAR ENTRADA
    // =================================================

    // Registramos la entrada como confirmada.
    //
    // fecha_compra se genera automáticamente en MySQL
    // porque la columna utiliza CURRENT_TIMESTAMP.
    const [resultadoEntrada] = await connection.query(
      `
        INSERT INTO entradas (
          usuario_id,
          funcion_id,
          codigo,
          estado
        )
        VALUES (?, ?, ?, 'confirmada')
      `,
      [
        usuarioId,
        funcionId,
        codigo
      ]
    );

    // MySQL devuelve el identificador generado
    // automáticamente mediante AUTO_INCREMENT.
    const entradaId = resultadoEntrada.insertId;


    // =================================================
    // ASOCIAR ASIENTOS A LA ENTRADA
    // =====================================================

    // Construimos un arreglo con los registros
    // que insertaremos en entrada_asientos.
    //
    // Por ejemplo:
    //
    // [
    //   [4, 1, 2],
    //   [4, 1, 3]
    // ]
    //
    // donde cada elemento representa:
    //
    // [entrada_id, funcion_id, asiento_id]
    const valoresAsientos = asientosIds.map(
      (asientoId) => [
        entradaId,
        funcionId,
        asientoId
      ]
    );

    // Insertamos todos los asientos seleccionados
    // en una sola consulta.
    await connection.query(
      `
        INSERT INTO entrada_asientos (
          entrada_id,
          funcion_id,
          asiento_id
        )
        VALUES ?
      `,
      [valoresAsientos]
    );


    // =================================================
    // CONFIRMAR TRANSACCIÓN
    // =====================================================

    // Si llegamos hasta aquí significa que todas
    // las operaciones fueron exitosas.
    //
    // COMMIT hace permanentes los cambios.
    await connection.commit();


    // =================================================
    // DEVOLVER RESULTADO
    // =====================================================

    return {
      id: entradaId,
      usuario_id: usuarioId,
      funcion_id: funcionId,
      codigo,
      estado: 'confirmada',
      asientos: asientosIds
    };

  } catch (error) {
    // =================================================
    // CANCELAR TRANSACCIÓN
    // =====================================================

    // Si cualquier consulta falla, deshacemos
    // todos los cambios realizados desde BEGIN.
    await connection.rollback();

    // Volvemos a lanzar el error para que pueda
    // manejarlo el controlador.
    throw error;

  } finally {
    // =================================================
    // LIBERAR CONEXIÓN
    // =====================================================

    // Siempre devolvemos la conexión al pool,
    // tanto si la compra funcionó como si falló.
    connection.release();
  }
};

// =====================================================
// OBTENER HISTORIAL DE ENTRADAS DEL USUARIO
// =====================================================

// Esta función obtiene todas las entradas pertenecientes
// a un usuario.
//
// Además de los datos básicos de la entrada,
// recuperamos información de:
//
// - la película
// - la función
// - los asientos
//
// Para conseguirlo utilizamos JOIN entre las tablas
// relacionadas de nuestra base de datos.
const obtenerEntradasPorUsuario = async (usuarioId) => {
  const [rows] = await pool.query(
    `
      SELECT
        e.id AS entrada_id,
        e.codigo,
        e.estado,
        e.fecha_compra,

        p.id AS pelicula_id,
        p.titulo AS pelicula_titulo,
        p.poster AS pelicula_poster,

        f.id AS funcion_id,
        f.fecha AS funcion_fecha,
        f.hora AS funcion_hora,
        f.sala AS funcion_sala,

        a.id AS asiento_id,
        a.fila AS asiento_fila,
        a.numero AS asiento_numero

      FROM entradas AS e

      INNER JOIN funciones AS f
        ON f.id = e.funcion_id

      INNER JOIN peliculas AS p
        ON p.id = f.pelicula_id

      LEFT JOIN entrada_asientos AS ea
        ON ea.entrada_id = e.id

      LEFT JOIN asientos AS a
        ON a.id = ea.asiento_id

      WHERE e.usuario_id = ?

      ORDER BY
        e.fecha_compra DESC,
        e.id DESC,
        a.fila ASC,
        a.numero ASC
    `,
    [usuarioId]
  );

  return rows;
};

// =====================================================
// EXPORTACIÓN DEL SERVICIO
// =====================================================

// =====================================================
// EXPORTACIÓN DEL SERVICIO
// =====================================================

module.exports = {
  obtenerAsientosPorIds,
  obtenerAsientosOcupados,
  crearEntrada,
  obtenerEntradasPorUsuario
};