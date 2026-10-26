// Importamos el servicio encargado de registrar compras.
const {
  registrarCompraConfiteria,
  obtenerHistorialConfiteria,
} = require("../services/compraConfiteria.service");

// =====================================================
// CONTROLADOR: CONFIRMAR COMPRA
// =====================================================

const confirmarCompraConfiteria = async (req, res) => {
  try {
    // El usuario fue autenticado por verificarToken.
    const usuarioId = req.usuario.id;

    // Obtenemos los productos enviados por React.
    const { productos } = req.body;

    // Comprobamos que el carrito contenga productos.
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "El carrito está vacío",
      });
    }

    // Evitamos productos duplicados en la misma compra.
    const ids = productos.map((item) => item?.producto_id);

    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({
        ok: false,
        message: "El carrito contiene productos duplicados",
      });
    }

    // Comprobamos identificadores y cantidades.
    // También limitamos las unidades por producto
    // para evitar solicitudes excesivas.
    const datosInvalidos = productos.some(
      (item) =>
        !item ||
        !Number.isSafeInteger(item.producto_id) ||
        item.producto_id <= 0 ||
        !Number.isSafeInteger(item.cantidad) ||
        item.cantidad < 1 ||
        item.cantidad > 100,
    );

    if (datosInvalidos || productos.length > 50) {
      return res.status(400).json({
        ok: false,
        message: "Los productos o cantidades son inválidos",
      });
    }

    // Registramos la compra mediante el servicio.
    const compra = await registrarCompraConfiteria(usuarioId, productos);

    return res.status(201).json({
      ok: true,
      message: "Compra de confitería realizada correctamente",
      compra,
    });
  } catch (error) {
    // Mostramos el error para depuración.
    console.error("Error al confirmar compra de confitería:", error.message);

    // Devolvemos errores de validación conocidos.
    if (error.status === 400) {
      return res.status(400).json({
        ok: false,
        message: error.message,
      });
    }

    // Ocultamos detalles internos de MySQL.
    return res.status(500).json({
      ok: false,
      message: "No fue posible registrar la compra",
    });
  }
};

// =====================================================
// CONSULTAR HISTORIAL DE CONFITERÍA
// =====================================================

const consultarHistorialConfiteria = async (req, res) => {
  try {
    // Obtenemos el ID desde el JWT validado.
    // No aceptamos un usuario_id enviado por el cliente.
    const usuarioId = req.usuario.id;

    // Consultamos las compras correspondientes al usuario.
    const compras = await obtenerHistorialConfiteria(usuarioId);

    // Devolvemos el historial al frontend.
    return res.status(200).json({
      ok: true,
      compras,
    });
  } catch (error) {
    // Registramos el error para facilitar su diagnóstico.
    console.error("Error al consultar historial de confitería:", error);

    return res.status(500).json({
      ok: false,
      message: "No fue posible obtener el historial de compras",
    });
  }
};

// Exportamos ambos controladores.
module.exports = {
  confirmarCompraConfiteria,
  consultarHistorialConfiteria,
};
