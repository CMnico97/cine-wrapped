// Importamos el módulo crypto incluido en Node.js.
//
// Lo utilizaremos para generar un identificador
// aleatorio para el código de cada entrada.
const crypto = require("crypto");

// Importamos el pool de conexiones a MySQL.
//
// Además de ejecutar consultas normales,
// utilizaremos este pool para obtener una conexión
// exclusiva durante la transacción.
const pool = require("../config/database");

// Importamos las funciones del sistema de puntos.
// Permiten consultar el saldo, calcular descuentos
// y registrar los puntos de cada compra.
const {
  obtenerBilleteraBloqueada,
  calcularCanje,
  registrarPuntosCompra,
} = require("./puntos.service");

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
    [asientosIds],
  );

  return rows;
};

// =====================================================
// OBTENER ASIENTOS OCUPADOS
// =====================================================

// Comprueba cuáles de los asientos seleccionados
// ya están asociados a una entrada para la función.
const obtenerAsientosOcupados = async (funcionId, asientosIds) => {
  const [rows] = await pool.query(
    `
      SELECT
        asiento_id
      FROM entrada_asientos
      WHERE funcion_id = ?
        AND asiento_id IN (?)
    `,
    [funcionId, asientosIds],
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
// Recibimos los puntos que el usuario desea canjear.
//
// Por defecto usamos 0 para mantener funcionando
// las compras que todavía no envían puntos.
const crearEntrada = async (
  usuarioId,
  funcionId,
  asientosIds,
  puntosSolicitados = 0,
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

    // =====================================================
    // OBTENER EL PRECIO DE LA FUNCIÓN
    // =====================================================

    // Consultamos el precio directamente en MySQL.
    // No utilizamos un precio enviado desde el frontend,
    // porque podría ser manipulado por el usuario.
    const [funciones] = await connection.query(
      `
    SELECT
      id,
      sala,
      precio_entrada
    FROM funciones
    WHERE id = ?
    FOR UPDATE
  `,
      [funcionId],
    );

    // Verificamos que la función exista.
    if (funciones.length === 0) {
      const error = new Error("La función seleccionada no existe");
      error.code = "FUNCION_NO_EXISTE";
      throw error;
    }

    // Obtenemos los datos de la función.
    const funcion = funciones[0];

    // Validamos que se hayan seleccionado asientos.
    if (
      !Array.isArray(asientosIds) ||
      asientosIds.length === 0 ||
      !asientosIds.every((id) => Number.isSafeInteger(id) && id > 0) ||
      new Set(asientosIds).size !== asientosIds.length
    ) {
      const error = new Error("Los asientos seleccionados no son válidos");
      error.code = "ASIENTOS_INVALIDOS";
      throw error;
    }

    // Obtenemos el precio de una entrada.
    const precioEntrada = Number(funcion.precio_entrada);

    // Validamos el precio registrado.
    if (!Number.isSafeInteger(precioEntrada) || precioEntrada <= 0) {
      const error = new Error("El precio de la función no es válido");
      error.code = "PRECIO_INVALIDO";
      throw error;
    }

    // Calculamos la cantidad de entradas.
    const cantidadEntradas = asientosIds.length;

    // Calculamos el subtotal.
    const subtotal = precioEntrada * cantidadEntradas;

    // Verificamos que el monto sea seguro y pueda
    // almacenarse en DECIMAL(10,2) de MySQL.
    if (!Number.isSafeInteger(subtotal) || subtotal > 99999999) {
      const error = new Error(
        "El total de la compra supera el monto permitido",
      );

      error.code = "MONTO_INVALIDO";
      throw error;
    }

    // =================================================
    // CALCULAR DESCUENTO Y PUNTOS DE LA COMPRA
    // =================================================

    // Consultamos y bloqueamos la billetera del usuario.
    //
    // Utilizamos la misma conexión de la transacción
    // para impedir que dos compras gasten los mismos puntos.
    const saldoDisponible = await obtenerBilleteraBloqueada(
      connection,
      usuarioId,
    );

    // Calculamos el descuento y los puntos ganados.
    //
    // El servicio de puntos comprueba:
    // - Que el saldo sea suficiente.
    // - Que el descuento no supere el 50%.
    // - Que los puntos solicitados sean válidos.
    const calculo = calcularCanje(subtotal, puntosSolicitados, saldoDisponible);

    // Guardamos los valores calculados para utilizarlos
    // en el INSERT de la entrada y en la respuesta.
    const puntosUtilizados = calculo.puntosUtilizados;
    const descuentoPuntos = calculo.descuento;
    const total = calculo.total;
    const puntosGanados = calculo.puntosGanados;

    // =================================================
    // VALIDAR ASIENTOS DE LA SALA
    // =================================================

    // Consultamos los asientos seleccionados
    // utilizando la misma conexión de la transacción.
    //
    // FOR UPDATE bloquea estos registros mientras
    // procesamos la compra.
    const [asientosValidos] = await connection.query(
      `
        SELECT
          id,
          sala,
          fila,
          numero
        FROM asientos
        WHERE id IN (?)
        FOR UPDATE
      `,
      [asientosIds],
    );

    // Comprobamos que todos los asientos enviados
    // realmente existan en la base de datos.
    if (asientosValidos.length !== asientosIds.length) {
      const error = new Error("Uno o más asientos seleccionados no existen");

      error.code = "ASIENTOS_INVALIDOS";
      throw error;
    }

    // Comprobamos que todos los asientos pertenezcan
    // a la misma sala de la función seleccionada.
    const asientoDeOtraSala = asientosValidos.some(
      (asiento) => Number(asiento.sala) !== Number(funcion.sala),
    );

    if (asientoDeOtraSala) {
      const error = new Error(
        "Uno o más asientos no pertenecen a la sala de esta función",
      );

      error.code = "ASIENTOS_INVALIDOS";
      throw error;
    }

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
      [funcionId, asientosIds],
    );

    // Si encontramos algún asiento ocupado,
    // cancelamos la operación.
    if (asientosOcupados.length > 0) {
      const error = new Error(
        "Uno o más asientos seleccionados ya están ocupados",
      );

      // Guardamos un código para que el controlador
      // pueda reconocer este error de negocio.
      error.code = "ASIENTO_OCUPADO";

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

    // =====================================================
    // CREAR ENTRADA CON INFORMACIÓN DE PRECIOS
    // =====================================================

    // Guardamos el subtotal y el total final
    // para conservar el valor histórico de la compra.
    const [resultadoEntrada] = await connection.query(
      `
    INSERT INTO entradas (
      usuario_id,
      funcion_id,
      codigo,
      estado,
      subtotal,
      puntos_utilizados,
      descuento_puntos,
      total
    )
    VALUES (?, ?, ?, 'confirmada', ?, ?, ?, ?)
  `,
      [
        usuarioId,
        funcionId,
        codigo,
        subtotal,
        puntosUtilizados,
        descuentoPuntos,
        total,
      ],
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
    const valoresAsientos = asientosIds.map((asientoId) => [
      entradaId,
      funcionId,
      asientoId,
    ]);

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
      [valoresAsientos],
    );

    // =================================================
    // REGISTRAR LOS PUNTOS DE LA COMPRA
    // =================================================

    // Registramos los puntos utilizados y ganados.
    //
    // "entrada" identifica el origen de los movimientos.
    // entradaId corresponde a la entrada recién creada.
    //
    // Como utilizamos la misma conexión, si falla
    // el registro de puntos, también se revertirá
    // la compra y la asignación de asientos.
    await registrarPuntosCompra(
      connection,
      usuarioId,
      "entrada",
      entradaId,
      calculo,
    );

    // =================================================
    // CONFIRMAR TRANSACCIÓN
    // =====================================================

    // Si llegamos hasta aquí significa que todas
    // las operaciones fueron exitosas.
    //
    // COMMIT hace permanentes los cambios.
    await connection.commit();

    // =====================================================
    // DEVOLVER RESULTADO DE LA COMPRA
    // =====================================================

    // Devolvemos la entrada confirmada y los puntos
    // obtenidos por esta compra.
    return {
      id: entradaId,
      usuario_id: usuarioId,
      funcion_id: funcionId,
      codigo,
      estado: "confirmada",
      asientos: asientosIds,

      // Información económica.
      precio_entrada: precioEntrada,
      cantidad_entradas: cantidadEntradas,
      subtotal,
      puntos_utilizados: puntosUtilizados,
      descuento_puntos: descuentoPuntos,
      total,

      // Puntos acumulados por la compra.
      puntos_ganados: puntosGanados,
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

        e.subtotal,
        e.puntos_utilizados,
        e.descuento_puntos,
        e.total,

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
    [usuarioId],
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
  obtenerEntradasPorUsuario,
};
