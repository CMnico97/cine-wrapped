
 // =====================================================
 // SERVICIO DE PUNTOS - CINE WRAPPED
 // =====================================================

 // Este servicio administra los puntos obtenidos
 // y utilizados en las compras simuladas.

 // IMPORTANTE:
 // Las funciones que modifican puntos deben ejecutarse
 // dentro de la misma transacción de la compra.
 //
 // Este archivo NO inicia ni confirma transacciones.
 // La conexión MySQL se recibe como parámetro.

 // =====================================================
 // REGLAS DEL PROGRAMA DE PUNTOS
 // =====================================================

 // Por cada $100 CLP pagados se obtiene 1 punto.
 const PESOS_POR_PUNTO = 100;

 // Cada punto utilizado equivale a $10 CLP.
 const VALOR_PUNTO = 10;

 // El descuento máximo permitido es del 50%.
 const DESCUENTO_MAXIMO = 0.5;

 // Máximo valor permitido por DECIMAL(10,2),
 // expresado en pesos chilenos enteros.
 const MONTO_MAXIMO = 99999999;

 // =====================================================
 // OBTENER Y BLOQUEAR BILLETERA
 // =====================================================

 // Esta función obtiene el saldo del usuario.
 //
 // FOR UPDATE bloquea la billetera mientras dure
 // la transacción para evitar que dos compras
 // utilicen simultáneamente los mismos puntos.

 const obtenerBilleteraBloqueada = async (
   conexion,
   usuarioId
 ) => {
   // Creamos una billetera con 0 puntos si
   // el usuario todavía no tiene una.
   //
   // Si ya existe, conservamos su saldo.
   await conexion.query(
     `
       INSERT INTO billeteras_puntos (
         usuario_id,
         saldo
       )
       VALUES (?, 0)
       ON DUPLICATE KEY UPDATE
         usuario_id = usuario_id
     `,
     [usuarioId]
   );

   // Consultamos y bloqueamos la billetera.
   const [filas] = await conexion.query(
     `
       SELECT saldo
       FROM billeteras_puntos
       WHERE usuario_id = ?
       FOR UPDATE
     `,
     [usuarioId]
   );

   // Comprobamos que la billetera exista.
   if (filas.length === 0) {
     throw new Error(
       "No fue posible obtener la billetera de puntos"
     );
   }

   // Devolvemos el saldo como número.
   return Number(filas[0].saldo);
 };

 // =====================================================
 // CALCULAR CANJE DE PUNTOS
 // =====================================================

 // Calcula el descuento, el total a pagar
 // y los puntos que ganará el usuario.
 //
 // Esta función NO modifica la base de datos.
 //
 // Parámetros:
 // subtotal: precio original en pesos enteros.
 // puntosSolicitados: puntos que desea utilizar.
 // saldoDisponible: puntos actuales del usuario.

 const calcularCanje = (
   subtotal,
   puntosSolicitados,
   saldoDisponible
 ) => {
   // =================================================
   // VALIDAR SUBTOTAL
   // =================================================

   // El subtotal debe ser un entero positivo
   // y no superar la capacidad de DECIMAL(10,2).
   if (
     !Number.isSafeInteger(subtotal) ||
     subtotal <= 0 ||
     subtotal > MONTO_MAXIMO
   ) {
     const error = new Error(
       "El subtotal de la compra no es válido"
     );

     error.status = 400;
     throw error;
   }

   // =================================================
   // VALIDAR PUNTOS SOLICITADOS
   // =================================================

   // No permitimos puntos negativos,
   // decimales ni valores no numéricos.
   if (
     !Number.isSafeInteger(puntosSolicitados) ||
     puntosSolicitados < 0
   ) {
     const error = new Error(
       "La cantidad de puntos solicitados no es válida"
     );

     error.status = 400;
     throw error;
   }

   // =================================================
   // VALIDAR SALDO DISPONIBLE
   // =================================================

   // Comprobamos que el saldo obtenido de MySQL
   // sea un número entero no negativo.
   if (
     !Number.isSafeInteger(saldoDisponible) ||
     saldoDisponible < 0
   ) {
     throw new Error(
       "El saldo de puntos no es válido"
     );
   }

   // El usuario no puede utilizar más puntos
   // de los que tiene disponibles.
   if (puntosSolicitados > saldoDisponible) {
     const error = new Error(
       "No tienes suficientes puntos disponibles"
     );

     error.status = 400;
     throw error;
   }

   // =================================================
   // CALCULAR DESCUENTO MÁXIMO
   // =================================================

   // Calculamos el 50% del subtotal.
   const descuentoMaximoPesos = Math.floor(
     subtotal * DESCUENTO_MAXIMO
   );

   // Convertimos ese descuento máximo
   // a una cantidad de puntos.
   const puntosMaximos = Math.floor(
     descuentoMaximoPesos / VALOR_PUNTO
   );

   // Impedimos superar el descuento máximo.
   if (puntosSolicitados > puntosMaximos) {
     const error = new Error(
       "Los puntos solicitados superan el descuento máximo del 50%"
     );

     error.status = 400;
     throw error;
   }

   // =================================================
   // CALCULAR TOTAL Y PUNTOS GANADOS
   // =================================================

   // Cada punto equivale a $10 CLP.
   const descuento = puntosSolicitados * VALOR_PUNTO;

   // Restamos el descuento al subtotal.
   const total = subtotal - descuento;

   // Los puntos se generan únicamente
   // sobre el monto efectivamente pagado.
   const puntosGanados = Math.floor(
     total / PESOS_POR_PUNTO
   );

   // Devolvemos los cálculos para utilizarlos
   // al registrar la compra.
   return {
     puntosUtilizados: puntosSolicitados,
     descuento,
     total,
     puntosGanados,
   };
 };

 // =====================================================
 // REGISTRAR MOVIMIENTOS DE PUNTOS
 // =====================================================

 // Registra los puntos canjeados y acumulados.
 //
 // Debe ejecutarse dentro de la transacción
 // de una compra confirmada.
 //
 // origen:
 // "entrada" o "confiteria".
 //
 // compraId:
 // ID de la entrada o compra de confitería.
 //
 // calculo:
 // Resultado de calcularCanje().

 const registrarPuntosCompra = async (
   conexion,
   usuarioId,
   origen,
   compraId,
   calculo
 ) => {
   // =================================================
   // VALIDAR ORIGEN
   // =================================================

   // Solo aceptamos compras de entradas
   // o de confitería.
   if (!["entrada", "confiteria"].includes(origen)) {
     const error = new Error(
       "Origen de puntos no válido"
     );

     error.status = 400;
     throw error;
   }

   // Comprobamos que el ID de compra sea válido.
   if (
     !Number.isSafeInteger(compraId) ||
     compraId <= 0
   ) {
     const error = new Error(
       "Identificador de compra inválido"
     );

     error.status = 400;
     throw error;
   }

   // =================================================
   // REGISTRAR CANJE DE PUNTOS
   // =================================================

   // Solo registramos un movimiento de canje
   // si el usuario utilizó puntos.
   if (calculo.puntosUtilizados > 0) {
     await conexion.query(
       `
         INSERT INTO movimientos_puntos (
           usuario_id,
           tipo,
           origen,
           compra_id,
           puntos
         )
         VALUES (?, 'canje', ?, ?, ?)
       `,
       [
         usuarioId,
         origen,
         compraId,
         calculo.puntosUtilizados,
       ]
     );
   }

   // =================================================
   // REGISTRAR ACUMULACIÓN DE PUNTOS
   // =================================================

   // Solo registramos una acumulación cuando
   // la compra genera al menos un punto.
   if (calculo.puntosGanados > 0) {
     await conexion.query(
       `
         INSERT INTO movimientos_puntos (
           usuario_id,
           tipo,
           origen,
           compra_id,
           puntos
         )
         VALUES (?, 'acumulacion', ?, ?, ?)
       `,
       [
         usuarioId,
         origen,
         compraId,
         calculo.puntosGanados,
       ]
     );
   }

   // =================================================
   // ACTUALIZAR SALDO
   // =================================================

   // Descontamos los puntos utilizados y
   // sumamos los puntos obtenidos.
   //
   // La condición saldo >= ? evita que
   // la billetera quede con saldo negativo.
   const [resultado] = await conexion.query(
     `
       UPDATE billeteras_puntos
       SET saldo = saldo - ? + ?
       WHERE usuario_id = ?
         AND saldo >= ?
     `,
     [
       calculo.puntosUtilizados,
       calculo.puntosGanados,
       usuarioId,
       calculo.puntosUtilizados,
     ]
   );

   // =================================================
   // VERIFICAR ACTUALIZACIÓN
   // =================================================

   // Si no se encontró la billetera o el saldo
   // es insuficiente, lanzamos un error.
   //
   // El servicio de compra realizará rollback
   // y revertirá todos los cambios.
   if (resultado.affectedRows !== 1) {
     const error = new Error(
       "No fue posible actualizar el saldo de puntos"
     );

     error.status = 400;
     throw error;
   }
 };

 // =====================================================
 // EXPORTACIONES
 // =====================================================

 // Estas funciones podrán utilizarse desde
 // entrada.service.js y compraConfiteria.service.js.

 module.exports = {
   obtenerBilleteraBloqueada,
   calcularCanje,
   registrarPuntosCompra,
 };
