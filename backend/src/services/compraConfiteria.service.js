const pool = require("../config/database");

// Importamos las operaciones del programa de puntos.
const {
  obtenerBilleteraBloqueada,
  calcularCanje,
  registrarPuntosCompra,
} = require("./puntos.service");

// =====================================================
// REGISTRAR COMPRA SIMULADA DE CONFITERÍA
// =====================================================

const registrarCompraConfiteria = async (
  usuarioId,
  productos,
  puntosSolicitados = 0,
) => {
  // Reservamos una conexión del pool para que
  // todas las operaciones utilicen la misma transacción.
  const conexion = await pool.getConnection();

  try {
    // Iniciamos una transacción.
    await conexion.beginTransaction();

    let total = 0;
    const detalles = [];

    // =================================================
    // CONSULTAR Y VALIDAR PRODUCTOS
    // =================================================

    for (const item of productos) {
      // Buscamos el producto directamente en MySQL.
      // Nunca confiamos en los precios enviados por React.
      const [filas] = await conexion.query(
        `SELECT id, nombre, precio, disponible
         FROM productos
         WHERE id = ?`,
        [item.producto_id],
      );

      // Comprobamos que exista y esté disponible.
      if (filas.length === 0 || !filas[0].disponible) {
        const error = new Error("Uno de los productos no está disponible");
        error.status = 400;
        throw error;
      }

      const producto = filas[0];

      // Validamos que la cantidad sea un entero positivo.
      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        const error = new Error("Cantidad inválida");
        error.status = 400;
        throw error;
      }

      // =================================================
      // VALIDAR PRECIO Y CALCULAR SUBTOTAL DEL PRODUCTO
      // =================================================

      // Convertimos el precio almacenado en MySQL a centavos.
      const precioCentavos = Math.round(Number(producto.precio) * 100);

      // Comprobamos que el precio sea válido y positivo.
      if (!Number.isSafeInteger(precioCentavos) || precioCentavos <= 0) {
        const error = new Error("El precio del producto no es válido");
        error.status = 400;
        throw error;
      }

      // Calculamos el subtotal del producto.
      const subtotalCentavos = precioCentavos * item.cantidad;

      // Comprobamos que el cálculo no supere
      // el rango seguro de JavaScript.
      if (!Number.isSafeInteger(subtotalCentavos)) {
        const error = new Error("El subtotal del producto es demasiado grande");
        error.status = 400;
        throw error;
      }

      // Sumamos el producto al total acumulado.
      total += subtotalCentavos;

      // Comprobamos que el total acumulado sea seguro.
      if (!Number.isSafeInteger(total)) {
        const error = new Error("El total de la compra es demasiado grande");
        error.status = 400;
        throw error;
      }

      // Guardamos temporalmente el detalle.
      detalles.push({
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnitario: (precioCentavos / 100).toFixed(2),
        subtotal: (subtotalCentavos / 100).toFixed(2),
      });
    }

    // Convertimos el total a formato DECIMAL.
    // =====================================================
    // CALCULAR SUBTOTAL Y PUNTOS
    // =====================================================

    // Convertimos los centavos acumulados a pesos.
    //
    // El programa de puntos trabaja con pesos
    // chilenos enteros, por lo que rechazamos
    // subtotales con fracciones de peso.
    if (total % 100 !== 0) {
      const error = new Error("El subtotal debe expresarse en pesos enteros");
      error.status = 400;
      throw error;
    }

    const subtotal = total / 100;

    // Bloqueamos la billetera del usuario antes
    // de calcular y aplicar el descuento.
    const saldoDisponible = await obtenerBilleteraBloqueada(
      conexion,
      usuarioId,
    );

    // Calculamos el canje y los puntos ganados.
    const calculo = calcularCanje(subtotal, puntosSolicitados, saldoDisponible);

    // Guardamos los importes en formato DECIMAL.
    const subtotalCompra = subtotal.toFixed(2);
    const totalCompra = calculo.total.toFixed(2);
    const descuentoCompra = calculo.descuento.toFixed(2);

    // =================================================
    // CREAR COMPRA
    // =================================================

    // =====================================================
    // CREAR COMPRA CON DESCUENTO DE PUNTOS
    // =====================================================

    const [resultado] = await conexion.query(
      `
    INSERT INTO compras_confiteria (
      usuario_id,
      subtotal,
      puntos_utilizados,
      descuento_puntos,
      total,
      estado
    )
    VALUES (?, ?, ?, ?, ?, 'confirmada')
  `,
      [
        usuarioId,
        subtotalCompra,
        calculo.puntosUtilizados,
        descuentoCompra,
        totalCompra,
      ],
    );

    const compraId = resultado.insertId;

    // =================================================
    // REGISTRAR DETALLE DE COMPRA
    // =================================================

    for (const detalle of detalles) {
      await conexion.query(
        `INSERT INTO detalle_compra_confiteria
           (compra_id, producto_id, cantidad,
            precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          compraId,
          detalle.productoId,
          detalle.cantidad,
          detalle.precioUnitario,
          detalle.subtotal,
        ],
      );
    }

    // =====================================================
    // REGISTRAR LOS MOVIMIENTOS DE PUNTOS
    // =====================================================

    // Guardamos los puntos utilizados y ganados
    // dentro de la misma transacción de la compra.
    await registrarPuntosCompra(
      conexion,
      usuarioId,
      "confiteria",
      compraId,
      calculo,
    );

    // Confirmamos todos los cambios.
    await conexion.commit();

    // =====================================================
    // DEVOLVER INFORMACIÓN DE LA COMPRA Y LOS PUNTOS
    // =====================================================

    // Devolvemos los datos económicos de la compra,
    // incluyendo los puntos utilizados y ganados.
    return {
      id: compraId,
      subtotal: subtotalCompra,
      puntos_utilizados: calculo.puntosUtilizados,
      descuento_puntos: descuentoCompra,
      total: totalCompra,
      puntos_ganados: calculo.puntosGanados,
      estado: "confirmada",
    };
  } catch (error) {
    // Si algo falla, revertimos todos los cambios.
    await conexion.rollback();
    throw error;
  } finally {
    // Liberamos la conexión al pool.
    conexion.release();
  }
};

// =====================================================
// OBTENER HISTORIAL DE COMPRAS DE CONFITERÍA
// =====================================================

const obtenerHistorialConfiteria = async (usuarioId) => {
  // Consultamos únicamente las compras del usuario
  // autenticado, ordenadas desde la más reciente.
  // =================================================
  // CONSULTAR COMPRAS CON INFORMACIÓN DE PUNTOS
  // =================================================

  // Incluimos subtotal, puntos utilizados y descuento
  // para mostrarlos posteriormente en React.
  const [compras] = await pool.query(
    `
    SELECT
      id,
      fecha_compra,
      subtotal,
      puntos_utilizados,
      descuento_puntos,
      total,
      estado
    FROM compras_confiteria
    WHERE usuario_id = ?
    ORDER BY fecha_compra DESC, id DESC
  `,
    [usuarioId],
  );

  // Si el usuario todavía no ha comprado,
  // devolvemos un historial vacío.
  if (compras.length === 0) {
    return [];
  }

  // Obtenemos los identificadores de sus compras.
  const comprasIds = compras.map((compra) => compra.id);

  // Consultamos los productos asociados a esas compras.
  const [detalles] = await pool.query(
    `
    SELECT
      d.compra_id,
      d.producto_id,
      p.nombre AS producto,
      p.categoria,
      d.cantidad,
      d.precio_unitario,
      d.subtotal
    FROM detalle_compra_confiteria AS d
    INNER JOIN productos AS p
      ON p.id = d.producto_id
    WHERE d.compra_id IN (?)
    ORDER BY d.id ASC
    `,
    [comprasIds],
  );

  // Asociamos los productos a cada compra.
  return compras.map((compra) => ({
    ...compra,

    productos: detalles
      .filter((detalle) => detalle.compra_id === compra.id)
      .map((detalle) => ({
        producto_id: detalle.producto_id,
        nombre: detalle.producto,
        categoria: detalle.categoria,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        subtotal: detalle.subtotal,
      })),
  }));
};

// Exportamos las operaciones de compra e historial.
module.exports = {
  registrarCompraConfiteria,
  obtenerHistorialConfiteria,
};
