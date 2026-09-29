// Importamos la función que permite obtener
// una función del cine mediante su identificador.
const {
  obtenerFuncionPorId
} = require('../services/funcion.service');

// Importamos las operaciones necesarias
// para validar y registrar la compra.
const {
  obtenerAsientosPorIds,
  obtenerAsientosOcupados,
  crearEntrada: crearEntradaService
} = require('../services/entrada.service');


// =====================================================
// CREAR ENTRADA
// =====================================================

// Este controlador manejará:
//
// POST /entradas
//
// El usuario deberá estar autenticado mediante JWT.
//
// El cuerpo esperado será:
//
// {
//   "funcion_id": 1,
//   "asientos": [2, 3]
// }
const crearEntrada = async (req, res) => {
  try {
    // Obtenemos el usuario autenticado desde el JWT.
    //
    // verificarToken habrá guardado previamente
    // esta información dentro de req.usuario.
    const usuarioId = req.usuario.id;

    // Obtenemos los datos enviados por el cliente.
    const {
      funcion_id,
      asientos
    } = req.body;


    // =================================================
    // VALIDAR ID DE LA FUNCIÓN
    // =================================================

    // Convertimos el identificador recibido a número.
    const funcionId = Number(funcion_id);

    // El identificador debe ser un entero positivo.
    if (
      !Number.isInteger(funcionId) ||
      funcionId <= 0
    ) {
      return res.status(400).json({
        ok: false,
        message: 'El id de la función no es válido'
      });
    }


    // =================================================
    // VALIDAR ARREGLO DE ASIENTOS
    // =================================================

    // Debemos recibir un arreglo y este debe contener
    // al menos un asiento.
    if (
      !Array.isArray(asientos) ||
      asientos.length === 0
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Debe seleccionar al menos un asiento'
      });
    }

    // Convertimos todos los identificadores
    // de los asientos a números.
    const asientosIds = asientos.map(
      (asientoId) => Number(asientoId)
    );

    // Comprobamos que todos sean enteros positivos.
    const asientosValidos = asientosIds.every(
      (asientoId) =>
        Number.isInteger(asientoId) &&
        asientoId > 0
    );

    if (!asientosValidos) {
      return res.status(400).json({
        ok: false,
        message: 'Uno o más asientos no son válidos'
      });
    }


    // =================================================
    // VALIDAR ASIENTOS REPETIDOS
    // =================================================

    // Set elimina automáticamente valores repetidos.
    //
    // Si después de convertir el arreglo a Set
    // cambia su tamaño, significa que había
    // identificadores repetidos.
    const asientosUnicos = new Set(asientosIds);

    if (asientosUnicos.size !== asientosIds.length) {
      return res.status(400).json({
        ok: false,
        message: 'No puede seleccionar el mismo asiento más de una vez'
      });
    }


    // =================================================
    // COMPROBAR QUE LA FUNCIÓN EXISTA
    // =================================================

    const funcion = await obtenerFuncionPorId(
      funcionId
    );

    if (!funcion) {
      return res.status(404).json({
        ok: false,
        message: 'Función no encontrada'
      });
    }


    // =================================================
    // COMPROBAR QUE LOS ASIENTOS EXISTAN
    // =================================================

    const asientosEncontrados = await obtenerAsientosPorIds(
      asientosIds
    );

    // Si solicitamos, por ejemplo, dos asientos
    // pero MySQL solamente encontró uno, significa
    // que alguno de los ids enviados no existe.
    if (
      asientosEncontrados.length !==
      asientosIds.length
    ) {
      return res.status(404).json({
        ok: false,
        message: 'Uno o más asientos no existen'
      });
    }


    // =================================================
    // VALIDAR SALA DE LOS ASIENTOS
    // =================================================

    // Todos los asientos seleccionados deben pertenecer
    // a la misma sala de la función.
    const asientoSalaIncorrecta =
      asientosEncontrados.some(
        (asiento) =>
          asiento.sala !== funcion.sala
      );

    if (asientoSalaIncorrecta) {
      return res.status(400).json({
        ok: false,
        message:
          'Uno o más asientos no pertenecen a la sala de la función'
      });
    }


    // =================================================
    // VALIDAR DISPONIBILIDAD
    // =================================================

    // Consultamos si alguno de los asientos
    // seleccionados ya está ocupado para esta función.
    const asientosOcupados =
      await obtenerAsientosOcupados(
        funcionId,
        asientosIds
      );

    // Si obtenemos uno o más resultados,
    // no permitimos continuar con la compra.
    if (asientosOcupados.length > 0) {
      return res.status(409).json({
        ok: false,
        message:
          'Uno o más asientos seleccionados ya están ocupados'
      });
    }


// =====================================================
// CREAR LA ENTRADA
// =====================================================

// Todas las validaciones iniciales fueron superadas.
//
// Ahora ejecutamos la operación definitiva mediante
// una transacción en el servicio.
const entrada = await crearEntradaService(
  usuarioId,
  funcionId,
  asientosIds
);


// =====================================================
// RESPUESTA EXITOSA
// =====================================================

// HTTP 201 indica que un nuevo recurso
// fue creado correctamente.
return res.status(201).json({
  ok: true,
  message: 'Compra simulada realizada correctamente',
  entrada
});

  } catch (error) {
    // Mostramos el error técnico en la terminal
    // para facilitar la depuración durante el desarrollo.
    console.error(
      'Error al crear la entrada:',
      error.message
    );


    // ===================================================
    // ASIENTO OCUPADO
    // ===================================================

    // Este error puede ser detectado por nuestra
    // comprobación dentro de la transacción.
    if (error.code === 'ASIENTO_OCUPADO') {
      return res.status(409).json({
        ok: false,
        message:
          'Uno o más asientos seleccionados ya están ocupados'
      });
    }


    // ===================================================
    // PROTECCIÓN DE MYSQL CONTRA DOBLE ASIGNACIÓN
    // ===================================================

    // ER_DUP_ENTRY corresponde a una violación
    // de una restricción UNIQUE.
    //
    // Nuestra base de datos tiene:
    //
    // UNIQUE(funcion_id, asiento_id)
    //
    // por lo que esta es nuestra última barrera
    // contra dos compras simultáneas del mismo asiento.
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        ok: false,
        message:
          'Uno o más asientos seleccionados ya fueron ocupados'
      });
    }


    // Para cualquier otro problema devolvemos
    // un error interno genérico.
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};


// =====================================================
// EXPORTACIÓN DEL CONTROLADOR
// =====================================================

// Exportamos el controlador para utilizarlo
// posteriormente desde entrada.routes.js.
module.exports = {
  crearEntrada
};