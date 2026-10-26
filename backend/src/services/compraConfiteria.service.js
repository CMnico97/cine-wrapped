const pool = require("../config/database");

// =====================================================
// REGISTRAR COMPRA SIMULADA DE CONFITERÍA
// =====================================================

const registrarCompraConfiteria = async (usuarioId, productos) => {
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

      // Calculamos los importes en centavos para evitar
      // errores de precisión con números decimales.
      const precioCentavos = Math.round(Number(producto.precio) * 100);

      const subtotalCentavos = precioCentavos * item.cantidad;

      total += subtotalCentavos;

      // Guardamos temporalmente el detalle.
      detalles.push({
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnitario: (precioCentavos / 100).toFixed(2),
        subtotal: (subtotalCentavos / 100).toFixed(2),
      });
    }

    // Convertimos el total a formato DECIMAL.
    const totalCompra = (total / 100).toFixed(2);

    // =================================================
    // CREAR COMPRA
    // =================================================

    const [resultado] = await conexion.query(
      `INSERT INTO compras_confiteria
         (usuario_id, total, estado)
       VALUES (?, ?, 'confirmada')`,
      [usuarioId, totalCompra],
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

    // Confirmamos todos los cambios.
    await conexion.commit();

    // Devolvemos información de la compra.
    return {
      id: compraId,
      total: totalCompra,
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
  const [compras] = await pool.query(
    `
    SELECT
      id,
      fecha_compra,
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